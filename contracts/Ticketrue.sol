// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
/// @notice Hackathon prototype. Demo claims are testnet-only: createEvent refuses them on BOT Chain Mainnet.
/// @dev No individual seats: a concert has price "zones" (seated: three fixed zones, e.g. back/sides/front; tier: any
///      number of tiers). Buying picks a zone/tier and a quantity, up to MAX_TICKETS_PER_WALLET tickets per wallet
///      per concert, possibly split across several zones in one transaction. Each unit still becomes its own Ticket,
///      so resale and gate check-in stay per-ticket.
contract Ticketrue {
    address public organizer;
    address public pendingOrganizer;
    uint256 public nextTicketId = 1;
    struct EventData { bool exists; bool seated; bool demoClaims; uint256 tierCount; uint256 startsAt; bool closed; }
    struct Option { uint256 price; uint256 capacity; uint256 issued; }
    /// @dev `paid` is what this ticket's holder paid for it (0 for free demo claims). It is also the ceiling for any resale price.
    struct Ticket { uint256 id; uint256 eventId; address owner; uint256 issuedAt; bool valid; uint256 tier; bool used; uint256 paid; }
    mapping(uint256 => EventData) public events;
    mapping(uint256 => mapping(uint256 => Option)) public options;
    /// @notice How many tickets a wallet already holds for a concert (across all zones/tiers), capped at MAX_TICKETS_PER_WALLET.
    mapping(uint256 => mapping(address => uint256)) public ticketCountOf;
    mapping(uint256 => Ticket) public tickets;
    mapping(address => uint256[]) private owned;
    /// @notice Resale listing price per ticket. 0 means not listed.
    mapping(uint256 => uint256) public resalePrice;
    /// @notice Gate staff allowed to check tickets in, in addition to the organizer.
    mapping(address => bool) public staff;
    /// @notice Share of every resale (in basis points) that stays in the contract for the organizer.
    uint256 public constant RESALE_FEE_BPS = 500;
    uint256 public constant SEATED_ZONES = 3;
    uint256 public constant MAX_TICKETS_PER_WALLET = 4;
    uint256 private constant MAINNET_CHAIN_ID = 677;
    event EventCreated(uint256 indexed eventId);
    event TicketIssued(uint256 indexed ticketId, uint256 indexed eventId, address indexed owner);
    event TicketListed(uint256 indexed ticketId, uint256 indexed eventId, uint256 price);
    event ResaleCancelled(uint256 indexed ticketId);
    event TicketResold(uint256 indexed ticketId, address indexed from, address indexed to, uint256 price);
    event TicketCheckedIn(uint256 indexed ticketId, address indexed by);
    event StaffSet(address indexed account, bool allowed);
    event EventClosed(uint256 indexed eventId);
    event Withdrawn(address indexed recipient, uint256 amount);
    event OrganizerTransferStarted(address indexed from, address indexed to);
    event OrganizerTransferred(address indexed from, address indexed to);
    modifier onlyOrganizer() { require(msg.sender == organizer, "Organizer only"); _; }
    constructor() { organizer = msg.sender; }
    /// @notice Two-step handover so the admin role can never be sent to a wrong address by mistake.
    function transferOrganizer(address next) external onlyOrganizer { require(next != address(0), "Zero address"); pendingOrganizer = next; emit OrganizerTransferStarted(msg.sender, next); }
    function acceptOrganizer() external { require(msg.sender == pendingOrganizer, "Not pending organizer"); emit OrganizerTransferred(organizer, msg.sender); organizer = msg.sender; pendingOrganizer = address(0); }
    function createEvent(uint256 id, bool seated, bool demoClaims, uint256 startsAt, uint256[] calldata prices, uint256[] calldata capacities) external onlyOrganizer {
        require(!events[id].exists && prices.length > 0 && prices.length == capacities.length, "Invalid event");
        require(startsAt > block.timestamp, "Past event");
        require(!seated || prices.length == SEATED_ZONES, "Seated event needs three zone prices");
        require(!demoClaims || block.chainid != MAINNET_CHAIN_ID, "Demo claims are testnet only");
        events[id] = EventData(true, seated, demoClaims, prices.length, startsAt, false);
        for(uint256 i; i<prices.length; i++) { require(capacities[i]>0, "Invalid capacity"); options[id][i]=Option(prices[i],capacities[i],0); }
        emit EventCreated(id);
    }
    /// @notice Stops new primary sales for a concert (wrong price or date, or cancelled). Existing tickets and resale are unaffected.
    function closeEvent(uint256 id) external onlyOrganizer { require(events[id].exists && !events[id].closed, "Cannot close"); events[id].closed = true; emit EventClosed(id); }
    /// @notice Price and remaining count for one zone/tier. Works before, during and after the sale window (for display); buying enforces the window separately.
    function getOption(uint256 id, uint256 tier) public view returns(uint256 price, uint256 remaining) {
        EventData memory e = events[id]; require(e.exists && tier < e.tierCount, "Invalid event or tier");
        Option memory o = options[id][tier]; return (o.price, o.capacity - o.issued);
    }
    /// @notice Buys `qtys[i]` tickets of `tiers[i]` for each i, in one transaction. Reverts (refunding everything) unless every item fits and the exact total is paid.
    function buyTicket(uint256 id, uint256[] calldata tiers, uint256[] calldata qtys) external payable returns(uint256[] memory ids) {
        EventData memory e = _onSale(id);
        require(tiers.length == qtys.length && tiers.length > 0, "Invalid cart");
        uint256 total; uint256 totalQty;
        for (uint256 i; i < tiers.length; i++) {
            require(tiers[i] < e.tierCount && qtys[i] > 0, "Invalid item");
            Option memory o = options[id][tiers[i]];
            require(o.capacity - o.issued >= qtys[i], "Sold out");
            total += o.price * qtys[i]; totalQty += qtys[i];
        }
        require(msg.value == total, "Incorrect payment");
        require(ticketCountOf[id][msg.sender] + totalQty <= MAX_TICKETS_PER_WALLET, "Ticket limit reached");
        ids = _mint(id, tiers, qtys, totalQty, msg.sender, false);
    }
    /// @notice Free version of buyTicket, only for events created with demoClaims=true (testing).
    function claimDemoTicket(uint256 id, uint256[] calldata tiers, uint256[] calldata qtys) external returns(uint256[] memory ids) {
        require(events[id].demoClaims, "Demo claims disabled");
        EventData memory e = _onSale(id);
        require(tiers.length == qtys.length && tiers.length > 0, "Invalid cart");
        uint256 totalQty;
        for (uint256 i; i < tiers.length; i++) {
            require(tiers[i] < e.tierCount && qtys[i] > 0, "Invalid item");
            require(options[id][tiers[i]].capacity - options[id][tiers[i]].issued >= qtys[i], "Sold out");
            totalQty += qtys[i];
        }
        require(ticketCountOf[id][msg.sender] + totalQty <= MAX_TICKETS_PER_WALLET, "Ticket limit reached");
        ids = _mint(id, tiers, qtys, totalQty, msg.sender, true);
    }
    function _onSale(uint256 id) internal view returns(EventData memory e) {
        e = events[id]; require(e.exists && !e.closed && block.timestamp < e.startsAt, "Not on sale");
    }
    function _mint(uint256 id, uint256[] calldata tiers, uint256[] calldata qtys, uint256 totalQty, address to, bool free) internal returns(uint256[] memory ids) {
        ids = new uint256[](totalQty); uint256 k;
        for (uint256 i; i < tiers.length; i++) {
            uint256 price = free ? 0 : options[id][tiers[i]].price;
            options[id][tiers[i]].issued += qtys[i];
            for (uint256 j; j < qtys[i]; j++) {
                uint256 tid = nextTicketId++;
                tickets[tid] = Ticket(tid, id, to, block.timestamp, true, tiers[i], false, price);
                owned[to].push(tid); ids[k++] = tid;
                emit TicketIssued(tid, id, to);
            }
        }
        ticketCountOf[id][to] += totalQty;
    }
    // ---- Fair resale: a ticket can only be resold at or below what its holder paid. ----
    function listForResale(uint256 ticketId, uint256 price) external {
        Ticket storage t = tickets[ticketId];
        require(t.valid && t.owner == msg.sender, "Not your ticket");
        require(!t.used, "Ticket already used");
        require(block.timestamp < events[t.eventId].startsAt, "Event started");
        require(price > 0 && price <= t.paid, "Above amount paid");
        resalePrice[ticketId] = price;
        emit TicketListed(ticketId, t.eventId, price);
    }
    function cancelResale(uint256 ticketId) external {
        require(tickets[ticketId].owner == msg.sender && resalePrice[ticketId] > 0, "Not listed");
        delete resalePrice[ticketId];
        emit ResaleCancelled(ticketId);
    }
    function buyResale(uint256 ticketId) external payable {
        Ticket storage t = tickets[ticketId];
        uint256 price = resalePrice[ticketId];
        require(price > 0, "Not for sale");
        require(msg.value == price, "Incorrect payment");
        require(!t.used && block.timestamp < events[t.eventId].startsAt, "No longer transferable");
        address seller = t.owner;
        require(seller != msg.sender, "Own ticket");
        require(ticketCountOf[t.eventId][msg.sender] < MAX_TICKETS_PER_WALLET, "Ticket limit reached");
        delete resalePrice[ticketId];
        ticketCountOf[t.eventId][seller] -= 1;
        ticketCountOf[t.eventId][msg.sender] += 1;
        t.owner = msg.sender;
        t.paid = price;
        _removeOwned(seller, ticketId);
        owned[msg.sender].push(ticketId);
        (bool ok,) = payable(seller).call{value: price - (price * RESALE_FEE_BPS) / 10000}("");
        require(ok, "Payout failed");
        emit TicketResold(ticketId, seller, msg.sender, price);
    }
    function _removeOwned(address who, uint256 ticketId) internal {
        uint256[] storage a = owned[who];
        for (uint256 i; i < a.length; i++) { if (a[i] == ticketId) { a[i] = a[a.length - 1]; a.pop(); return; } }
    }

    // ---- Gate check-in: a ticket can be admitted once. ----
    function setStaff(address account, bool allowed) external onlyOrganizer { staff[account] = allowed; emit StaffSet(account, allowed); }
    function checkIn(uint256 ticketId) external {
        require(msg.sender == organizer || staff[msg.sender], "Staff only");
        Ticket storage t = tickets[ticketId];
        require(t.valid, "Unknown ticket");
        require(!t.used, "Already used");
        t.used = true;
        delete resalePrice[ticketId];
        emit TicketCheckedIn(ticketId, msg.sender);
    }
    /// @notice True only if `owner` holds the ticket and it has not been used at the gate.
    function admits(uint256 id, address owner) external view returns(bool) { Ticket storage t = tickets[id]; return t.valid && !t.used && t.owner == owner; }
    function verifyTicket(uint256 id,address owner) external view returns(bool) { return tickets[id].valid && tickets[id].owner==owner; }
    function hasTicketForEvent(uint256 id,address owner) external view returns(bool) { return ticketCountOf[id][owner]!=0; }
    function getWalletTickets(address owner) external view returns(uint256[] memory) { return owned[owner]; }
    function withdraw(address payable recipient) external onlyOrganizer { require(recipient!=address(0)); uint256 amount=address(this).balance; (bool ok,)=recipient.call{value:amount}(""); require(ok,"Withdraw failed"); emit Withdrawn(recipient,amount); }
}
