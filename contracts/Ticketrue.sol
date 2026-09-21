// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
/// @notice Hackathon prototype. Demo claims must only be enabled for test/demo events.
contract Ticketrue {
    address public immutable organizer;
    uint256 public nextTicketId = 1;
    struct EventData { bool exists; bool seated; bool demoClaims; uint256 tierCount; uint256 startsAt; }
    struct Option { uint256 price; uint256 capacity; uint256 issued; }
    /// @dev `paid` is what the current holder paid (0 for free demo claims). It is also the ceiling for any resale price.
    struct Ticket { uint256 id; uint256 eventId; address owner; uint256 issuedAt; bool valid; uint256 tier; uint256 seat; bool used; uint256 paid; }
    mapping(uint256 => EventData) public events;
    mapping(uint256 => mapping(uint256 => Option)) public options;
    mapping(uint256 => mapping(uint256 => bool)) public seatTaken;
    mapping(uint256 => mapping(address => uint256)) public ticketOf;
    mapping(uint256 => Ticket) public tickets;
    mapping(address => uint256[]) private owned;
    /// @notice Resale listing price per ticket. 0 means not listed.
    mapping(uint256 => uint256) public resalePrice;
    /// @notice Gate staff allowed to check tickets in, in addition to the organizer.
    mapping(address => bool) public staff;
    /// @notice Share of every resale (in basis points) that stays in the contract for the organizer.
    uint256 public constant RESALE_FEE_BPS = 500;
    event EventCreated(uint256 indexed eventId);
    event TicketIssued(uint256 indexed ticketId, uint256 indexed eventId, address indexed owner);
    event TicketListed(uint256 indexed ticketId, uint256 indexed eventId, uint256 price);
    event ResaleCancelled(uint256 indexed ticketId);
    event TicketResold(uint256 indexed ticketId, address indexed from, address indexed to, uint256 price);
    event TicketCheckedIn(uint256 indexed ticketId, address indexed by);
    event StaffSet(address indexed account, bool allowed);
    modifier onlyOrganizer() { require(msg.sender == organizer, "Organizer only"); _; }
    constructor() { organizer = msg.sender; }
    function createEvent(uint256 id, bool seated, bool demoClaims, uint256 startsAt, uint256[] calldata prices, uint256[] calldata capacities) external onlyOrganizer {
        require(!events[id].exists && prices.length > 0 && prices.length == capacities.length, "Invalid event");
        require(startsAt > block.timestamp, "Past event");
        require(!seated || prices.length == 1, "Seated event needs one option");
        events[id] = EventData(true, seated, demoClaims, prices.length, startsAt);
        for(uint256 i; i<prices.length; i++) { require(capacities[i]>0 && (!seated || capacities[i] <= 60), "Invalid capacity"); options[id][i]=Option(prices[i],capacities[i],0); }
        emit EventCreated(id);
    }
    function getOption(uint256 id,uint256 tier,uint256 seat) public view returns(uint256 price,uint256 remaining,bool taken) {
        EventData memory e=events[id]; require(e.exists && block.timestamp<e.startsAt && tier<e.tierCount,"Invalid event or tier");
        require(e.seated ? seat>0 && seat<=60 && tier==0 : seat==0,"Invalid seat");
        Option memory o=options[id][tier]; return(o.price,o.capacity-o.issued,e.seated && seatTaken[id][seat]);
    }
    function buyTicket(uint256 id,uint256 tier,uint256 seat) external payable returns(uint256) {
        (uint256 price,,)=getOption(id,tier,seat); require(msg.value==price,"Incorrect payment"); return _issue(id,tier,seat);
    }
    function claimDemoTicket(uint256 id,uint256 tier,uint256 seat) external returns(uint256) {
        require(events[id].demoClaims,"Demo claims disabled"); return _issue(id,tier,seat);
    }
    function _issue(uint256 id,uint256 tier,uint256 seat) internal returns(uint256 tid) {
        (,uint256 remaining,bool taken)=getOption(id,tier,seat);
        require(ticketOf[id][msg.sender]==0,"One ticket per wallet"); require(remaining>0 && !taken,"Sold out or seat taken");
        options[id][tier].issued++; if(events[id].seated)seatTaken[id][seat]=true;
        tid=nextTicketId++; tickets[tid]=Ticket(tid,id,msg.sender,block.timestamp,true,tier,seat,false,msg.value); ticketOf[id][msg.sender]=tid; owned[msg.sender].push(tid);
        emit TicketIssued(tid,id,msg.sender);
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
        require(ticketOf[t.eventId][msg.sender] == 0, "One ticket per wallet");
        delete resalePrice[ticketId];
        ticketOf[t.eventId][seller] = 0;
        ticketOf[t.eventId][msg.sender] = ticketId;
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
    function hasTicketForEvent(uint256 id,address owner) external view returns(bool) { return ticketOf[id][owner]!=0; }
    function getWalletTickets(address owner) external view returns(uint256[] memory) { return owned[owner]; }
    function withdraw(address payable recipient) external onlyOrganizer { require(recipient!=address(0)); (bool ok,)=recipient.call{value:address(this).balance}(""); require(ok,"Withdraw failed"); }
}
