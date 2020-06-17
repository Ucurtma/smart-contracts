pragma solidity ^0.5.11;

import "./zeppelin/lifecycle/Destructible.sol";
import "./FundingContract.sol";
import "./Deployer.sol";

contract DeploymentManager is Destructible {
    struct DeployedContract {
        address deployer;
        address contractAddress;
    }

    modifier isAllowedUser() {
        require(
            allowedUsers[msg.sender] == true,
            "You are not allowed to deploy a campaign."
        );
        _;
    }

    Deployer erc20Deployer;
    // address constant biliraAddress = 0x2C537E5624e4af88A7ae4060C022609376C8D0EB;

    mapping(address => bool) public allowedUsers;
    mapping(address => DeployedContract[]) public deployedContracts;
    mapping(address => uint256) public contractsCount;

    constructor(address _erc20Deployer) public {
        erc20Deployer = Deployer(_erc20Deployer);
        allowedUsers[msg.sender] = true;
    }

    event NewFundingContract(
        address indexed deployedAddress,
        address indexed deployer
    );

    function updateERC20Deployer(address _erc20Deployer) external onlyOwner {
        erc20Deployer = Deployer(_erc20Deployer);
    }

    function updateAllowedUserPermission(address _user, bool _isAllowed)
        external
        onlyOwner
    {
        require(_user != address(0), "User must be a valid address");
        allowedUsers[_user] = _isAllowed;
    }

    function deploy(
        uint256 _numberOfPlannedPayouts,
        uint256 _withdrawPeriod,
        uint256 _campaignEndTime,
        uint256 _amountPerPayment,
        address payable __owner,
        address _tokenAddress
    ) external isAllowedUser {
        if (_tokenAddress == address(0)) {
            revert("Can only deploy ERC20 Funding Campaign Contract");
        }

        FundingContract c = erc20Deployer.deploy(
            _numberOfPlannedPayouts,
            _withdrawPeriod,
            _campaignEndTime,
            _amountPerPayment,
            __owner,
            _tokenAddress,
            msg.sender
        );
        deployedContracts[msg.sender].push(
            DeployedContract(msg.sender, address(c))
        );
        contractsCount[msg.sender] += 1;
        emit NewFundingContract(address(c), msg.sender);
    }

    function withdrawFromAllContracts() public {
        DeployedContract[] storage contracts = deployedContracts[msg.sender];
        uint256 totalContracts = contracts.length;
        require(totalContracts > 0, "No contract deployed");

        for (uint256 index = 0; index < contracts.length; index++) {
            FundingContract fundingContract = FundingContract(
                contracts[index].contractAddress
            );
            fundingContract.withdraw();
        }
    }
}
