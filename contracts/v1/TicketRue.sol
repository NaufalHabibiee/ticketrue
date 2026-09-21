// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TicketRue {
    address public organizer;

    struct Event {
        string name;
        string description;
        uint256 totalTickets;
        uint256 claimedTickets;
        bool isActive;
    }

    struct Ticket {
        uint256 eventId;
        address claimer;
        uint256 claimDate;
        bool isValid;
    }

    mapping(uint256 => Event) public events;
    uint256 public eventCount = 0;
    mapping(uint256 => mapping(address => Ticket)) public tickets;
    mapping(uint256 => mapping(address => bool)) public hasClaimed;

    event EventCreated(uint256 indexed eventId, string name, uint256 totalTickets);
    event TicketClaimed(uint256 indexed eventId, address indexed claimer, uint256 claimDate);
    event EventClosed(uint256 indexed eventId);

    modifier onlyOrganizer() { require(msg.sender == organizer, "Only organizer"); _; }
    modifier eventExists(uint256 _eventId) { require(_eventId < eventCount, "Event does not exist"); _; }
    modifier eventIsActive(uint256 _eventId) { require(events[_eventId].isActive, "Event not active"); _; }

    constructor() { organizer = msg.sender; }

    function createEvent(string memory _name, string memory _description, uint256 _totalTickets) public onlyOrganizer {
        events[eventCount] = Event(_name, _description, _totalTickets, 0, true);
        emit EventCreated(eventCount, _name, _totalTickets);
        eventCount++;
    }

    function closeEvent(uint256 _eventId) public onlyOrganizer eventExists(_eventId) {
        events[_eventId].isActive = false;
        emit EventClosed(_eventId);
    }

    function claimTicket(uint256 _eventId) public eventExists(_eventId) eventIsActive(_eventId) {
        require(!hasClaimed[_eventId][msg.sender], "Already claimed");
        require(events[_eventId].claimedTickets < events[_eventId].totalTickets, "All tickets claimed");
        tickets[_eventId][msg.sender] = Ticket(_eventId, msg.sender, block.timestamp, true);
        hasClaimed[_eventId][msg.sender] = true;
        events[_eventId].claimedTickets++;
        emit TicketClaimed(_eventId, msg.sender, block.timestamp);
    }

    function hasTicket(uint256 _eventId, address _wallet) public view eventExists(_eventId) returns (bool) {
        return hasClaimed[_eventId][_wallet];
    }
    function getTicket(uint256 _eventId, address _wallet) public view eventExists(_eventId) returns (Ticket memory) {
        return tickets[_eventId][_wallet];
    }
    function getEvent(uint256 _eventId) public view eventExists(_eventId) returns (Event memory) {
        return events[_eventId];
    }
    function getAvailableTickets(uint256 _eventId) public view eventExists(_eventId) returns (uint256) {
        return events[_eventId].totalTickets - events[_eventId].claimedTickets;
    }
}
