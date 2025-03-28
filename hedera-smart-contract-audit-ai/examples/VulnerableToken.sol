// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title VulnerableToken
 * @dev A token contract with intentional vulnerabilities for educational purposes
 * DO NOT USE IN PRODUCTION
 */
contract VulnerableToken {
    string public name = "VulnerableToken";
    string public symbol = "VULN";
    uint8 public decimals = 18;
    uint256 public totalSupply = 1000000 * 10**18; // 1 million tokens with 18 decimals
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    constructor() {
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }
    
    // Vulnerability 1: No zero address check
    function transfer(address _to, uint256 _value) public returns (bool success) {
        // Missing zero address validation
        if (balanceOf[msg.sender] >= _value) {
            balanceOf[msg.sender] -= _value;
            balanceOf[_to] += _value;
            emit Transfer(msg.sender, _to, _value);
            return true;
        }
        return false;
    }
    
    // Vulnerability 2: No return value, violates ERC20 spec
    function approve(address _spender, uint256 _value) public {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        // Missing return statement
    }
    
    // Vulnerability 3: Integer overflow/underflow (though protected by Solidity 0.8+)
    // In older Solidity versions this would be dangerous
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        // No input validation
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;
        emit Transfer(_from, _to, _value);
        return true;
    }
    
    // Vulnerability 4: Re-entrancy vulnerability
    function withdraw(uint256 _amount) public {
        require(balanceOf[msg.sender] >= _amount, "Insufficient balance");
        
        // Transfer before state change (re-entrancy vulnerability)
        (bool success, ) = msg.sender.call{value: _amount}("");
        require(success, "Transfer failed");
        
        // State change after external call
        balanceOf[msg.sender] -= _amount;
    }
    
    // Vulnerability 5: Unauthorized token minting
    function mint(address _to, uint256 _amount) public {
        // No access control
        balanceOf[_to] += _amount;
        totalSupply += _amount;
        emit Transfer(address(0), _to, _amount);
    }
    
    // Vulnerability 6: Use of tx.origin for authentication
    function transferOwnership(address _newOwner) public {
        if (tx.origin == msg.sender) {
            // Using tx.origin is dangerous as it can be manipulated
            // Implementation would go here
        }
    }
    
    // Vulnerability 7: Unchecked return value
    function unsafeCall(address _target, bytes memory _data) public {
        // Unchecked return value
        _target.call(_data);
    }
    
    // Function to accept ETH
    receive() external payable {}
} 