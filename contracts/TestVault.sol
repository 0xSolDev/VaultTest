//SPDX-License-Identifier: MIT
pragma solidity 0.8.16;
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract TestVault is ReentrancyGuard {
    // SafeERC20 for checking malicious tokens
    using SafeERC20 for IERC20;

    //Events
    event Deposited(address, uint256);
    event Withdrawn(address, uint256);

    // User Struct
    struct User {
        address addr;
        uint256 amount;
    }

    User[] users;

    // Staking Token address
    address public immutable staking;

    // User Registered Number
    mapping(address => uint256) public regNum;

    constructor(address _staking) {
        require(_staking != address(0), "INVALID_TOKEN");
        staking = _staking;
    }

    // Deposit function
    function Deposit(uint256 amount) external nonReentrant {
        IERC20(staking).safeTransferFrom(msg.sender, address(this), amount);

        uint256 _regNum = regNum[msg.sender];
        if (_regNum == 0) {
            User memory _user;
            _user.addr = msg.sender;
            _user.amount = amount;

            users.push(_user);
            regNum[msg.sender] = users.length;
        } else {
            users[_regNum - 1].amount += amount;
        }
        emit Deposited(msg.sender, amount);
    }

    // Withdraw function
    function Withdraw(uint256 amount) external nonReentrant {
        uint256 _regNum = regNum[msg.sender];
        require(_regNum != 0, "NO_TOKENS_TO_WITHDRAW");

        User storage user = users[_regNum - 1];

        require(user.amount >= amount, "NOT_ENOUGH_TOKENS_TO_WITHDRAW");

        user.amount -= amount;

        IERC20(staking).safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    // Returns an address arrary of highest 2 users
    function highestUsers() public view returns (address[2] memory) {
        User[2] memory highest;
        for (uint256 i = 0; i < users.length; i++) {
            User memory user = users[i];

            if (user.amount > highest[0].amount) {
                highest[1] = highest[0];
                highest[0] = user;
            } else if (user.amount > highest[1].amount) {
                highest[1] = user;
            }
        }

        return [highest[0].addr, highest[1].addr];
    }
}
