// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title VulnerableToken
 * @dev A deliberately vulnerable ERC20-like token for testing security analysis tools
 * IMPORTANT: This contract contains intentional vulnerabilities for testing purposes.
 * DO NOT use in production!
 */
contract VulnerableToken {
    string public name = "Vulnerable Token";
    string public symbol = "VULN";
    uint8 public decimals = 18;
    uint256 public totalSupply;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    // Unsafe state variable - can be manipulated by inheritance
    bool public paused;
    
    // Missing events for transfers and approvals
    
    // Unsafe constructor - no access control
    constructor(uint256 initialSupply) {
        totalSupply = initialSupply * 10 ** uint256(decimals);
        balanceOf[msg.sender] = totalSupply;
    }
    
    // Missing function visibility specifier
    function transfer(address to, uint256 value) public returns (bool success) {
        // Missing zero-address check
        // Missing overflow check (though Solidity 0.8.0+ has built-in overflow checking)
        
        // Reentrancy vulnerability - state change after transfer
        (bool sent,) = to.call{value: 0}("");
        require(sent, "Failed to send token");
        
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        
        return true;
    }
    
    // Unsafe approve function - doesn't follow check-effects-interactions pattern
    function approve(address spender, uint256 value) public returns (bool success) {
        // Missing zero-address check
        allowance[msg.sender][spender] = value;
        return true;
    }
    
    // Vulnerable transferFrom - no checks on sender balance
    function transferFrom(address from, address to, uint256 value) public returns (bool success) {
        // Missing check if contract is paused
        
        // Incorrect allowance check
        if (allowance[from][msg.sender] >= 0) {
            allowance[from][msg.sender] -= value;
            
            // Missing zero-address check
            balanceOf[from] -= value;
            balanceOf[to] += value;
            return true;
        }
        return false;
    }
    
    // Dangerous function - allows arbitrary data execution
    function executeCode(address target, bytes memory data) public {
        // Unchecked external call - extremely dangerous
        (bool success,) = target.call(data);
        require(success, "Execution failed");
    }
    
    // Missing access control - any user can mint tokens
    function mint(address to, uint256 amount) public {
        balanceOf[to] += amount;
        totalSupply += amount;
    }
    
    // Vulnerable to front-running
    function setTokenPrice(uint256 newPrice) public {
        // Some price change logic
        // This function can be front-run
    }
    
    // Unchecked arithmetic (though Solidity 0.8.0+ has built-in overflow checking)
    function unsafeAdd(uint256 a, uint256 b) public pure returns (uint256) {
        // No overflow check
        return a + b;
    }
    
    // Unused storage variables - gas inefficiency
    uint256 private unusedVar1;
    uint256 private unusedVar2;
    
    // Gas inefficient loop
    function inefficientLoop(uint256[] memory data) public {
        uint256 storage_var = 0;
        
        for (uint256 i = 0; i < data.length; i++) {
            // Storage accessed in loop - gas inefficient
            storage_var += data[i];
        }
    }
    
    // Function that can potentially be reentered
    function withdraw(uint256 amount) public {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        
        // Reentrancy vulnerability - state change after external call
        (bool success,) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        balanceOf[msg.sender] -= amount;
    }
    
    // Use of tx.origin for authorization - vulnerable to phishing
    function transferOwnership(address newOwner) public {
        require(tx.origin == msg.sender, "Not authorized");
        // Transfer ownership logic here
    }
} 