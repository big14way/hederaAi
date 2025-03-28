// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title SimpleAuction
 * @dev Simple auction contract where users can bid for an item
 */
contract SimpleAuction {
    address payable public beneficiary;
    uint public auctionEndTime;
    
    // Current state of the auction
    address public highestBidder;
    uint public highestBid;
    
    // Allowed withdrawals of previous bids
    mapping(address => uint) pendingReturns;
    
    // Set to true at the end, disallows any change
    bool public ended;
    
    // Events that will be emitted on changes
    event HighestBidIncreased(address bidder, uint amount);
    event AuctionEnded(address winner, uint amount);
    
    // Errors
    error AuctionAlreadyEnded();
    error BidNotHighEnough(uint highestBid);
    error AuctionNotYetEnded();
    error AuctionEndAlreadyCalled();
    
    /**
     * Create a simple auction with `_biddingTime` seconds bidding time on
     * behalf of the beneficiary address `_beneficiary`.
     */
    constructor(uint _biddingTime, address payable _beneficiary) {
        beneficiary = _beneficiary;
        auctionEndTime = block.timestamp + _biddingTime;
    }
    
    /**
     * Bid on the auction with the value sent together with this transaction.
     * The value will only be refunded if the auction is not won.
     */
    function bid() public payable {
        // Check if the auction has ended
        if (block.timestamp > auctionEndTime)
            revert AuctionAlreadyEnded();
            
        // Check if the bid is high enough
        if (msg.value <= highestBid)
            revert BidNotHighEnough(highestBid);
            
        // Refund the previous highest bidder
        if (highestBid != 0) {
            pendingReturns[highestBidder] += highestBid;
        }
        
        // Update highest bidder
        highestBidder = msg.sender;
        highestBid = msg.value;
        emit HighestBidIncreased(msg.sender, msg.value);
    }
    
    /**
     * Withdraw a bid that was overbid.
     */
    function withdraw() public returns (bool) {
        uint amount = pendingReturns[msg.sender];
        if (amount > 0) {
            // Zero the pending refund before sending to prevent re-entrancy attacks
            pendingReturns[msg.sender] = 0;
            
            // Send the amount
            if (!payable(msg.sender).send(amount)) {
                // No need to call throw here, just reset the amount owing
                pendingReturns[msg.sender] = amount;
                return false;
            }
        }
        return true;
    }
    
    /**
     * End the auction and send the highest bid to the beneficiary.
     */
    function auctionEnd() public {
        // Check if the auction has already ended
        if (block.timestamp < auctionEndTime)
            revert AuctionNotYetEnded();
        if (ended)
            revert AuctionEndAlreadyCalled();
            
        // Set auction as ended
        ended = true;
        emit AuctionEnded(highestBidder, highestBid);
        
        // Send the money to the beneficiary
        beneficiary.transfer(highestBid);
    }
} 