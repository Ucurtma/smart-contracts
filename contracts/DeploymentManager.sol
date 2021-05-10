pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./FundingContract.sol";
import "./Deployer.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";

contract DeploymentManager is Ownable {
    using SafeERC20 for IERC20;

    struct DeployedContract {
        address deployer;
        address contractAddress;
    }

    struct FundingLevel {
        address campaign;
        uint256 requiredBalance;
    }

    modifier isAllowedUser() {
        require(
            allowedUsers[msg.sender] == true,
            "You are not allowed to deploy a campaign."
        );
        _;
    }

    event PaymentsMade(uint256 amount);

    Deployer erc20Deployer;

    mapping(address => bool) public allowedUsers;
    mapping(address => DeployedContract[]) public deployedContracts;
    mapping(address => uint256) public contractsCount;

    constructor(address _erc20Deployer) public {
        erc20Deployer = Deployer(_erc20Deployer);
        allowedUsers[msg.sender] = true;
    }

    receive() external payable {}

    event NewFundingContract(
        address indexed deployedAddress,
        address indexed deployer
    );

    function updateERC20Deployer(address _erc20Deployer) external onlyOwner {
        erc20Deployer = Deployer(_erc20Deployer);
    }

    function updateAllowedUserPermission(address _user, bool _isAllowed) external onlyOwner {
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

    function payoutToCampaigns(address tokenAddress) external {
        uint256 campaignsCount = contractsCount[msg.sender];
        require(campaignsCount > 0, "NoContracts");
        IERC20 token = IERC20(tokenAddress);

        for (uint256 index = 0; index < campaignsCount; index += 1) {
            (, address currentContractAddress) = getCampaign(index);
            FundingContract campaign = FundingContract(currentContractAddress);
            uint256 campaignBalance = token.balanceOf(currentContractAddress);
            if (
                campaign.canWithdraw() &&
                !campaign.cancelled() &&
                campaignBalance > 0 &&
                campaign.totalNumberOfPayoutsLeft() > 0
            ) {
                campaign.withdraw();
            }
        }
    }

    function makePayments(address[] calldata addresses, uint256[] calldata amounts, address tokenAddress) external isAllowedUser {
        require(addresses.length > 0, "addresses is empty");
        require(amounts.length > 0, "amounts is empty");
        require(amounts.length == addresses.length, "addresses and amounts arrays must have the same size");
        require(tokenAddress != address(0), "invalid token address");
        
        IERC20 token = IERC20(tokenAddress);
        uint256 spentAmount = 0;

        for (uint256 index = 0; index < addresses.length; index += 1) {
            address addr = addresses[index];
            require(addr != address(0), "invalid address");
            uint256 amount = amounts[index];
            require(amount > 0, "amount should be higher than 0");
           
            FundingContract campaign = FundingContract(addr);

            if (!campaign.cancelled() && campaign.totalNumberOfPayoutsLeft() > 0) {
                token.safeTransfer(addr, amount);
                spentAmount += amount;
            }
        }

        emit PaymentsMade(spentAmount);
    }

    function calculateShareAmounts(
        uint256 _campaignTopLimit,
        address[] memory _campaigns,
        address tokenAddress
    ) public view returns (address[] memory, uint256[] memory) {
        require(_campaigns.length > 0, "No campaigns given");

        IERC20 token = IERC20(tokenAddress);

        FundingLevel[] memory fundings = new FundingLevel[](contractsCount[msg.sender]);
        uint256 counter = 0;
        uint256 totalBalanceNeed;

        for (uint256 index = 0; index < _campaigns.length; index += 1) {
            address currentContractAddress = _campaigns[index];
            uint256 balanceOfContract = token.balanceOf(currentContractAddress);

            if (currentContractAddress != address(0) && _campaignTopLimit > balanceOfContract) {
                FundingContract campaign = FundingContract(currentContractAddress);

                if (!campaign.cancelled() && campaign.totalNumberOfPayoutsLeft() > 0) {
                    fundings[counter] = FundingLevel(currentContractAddress, _campaignTopLimit - balanceOfContract);
                    counter += 1;
                    totalBalanceNeed += _campaignTopLimit - balanceOfContract;
                }
            }
        }

        uint256 totalBalanceInContract = token.balanceOf(address(this));
        require(totalBalanceInContract > 0, "NoMoneyLeft");
        
        address[] memory addresses = new address[](fundings.length);
        uint256[] memory amounts = new uint256[](fundings.length);

        for (uint256 fundingIndex = 0; fundingIndex < counter; fundingIndex += 1) {
            FundingLevel memory level = fundings[fundingIndex];
            uint256 amountToPay = (totalBalanceInContract * level.requiredBalance) / totalBalanceNeed;

            if (amountToPay > level.requiredBalance) {
                amountToPay = level.requiredBalance;
            }

            addresses[fundingIndex] = fundings[fundingIndex].campaign;
            amounts[fundingIndex] = amountToPay;
        }
        
        return (addresses, amounts);
    }

    function getCampaign(uint256 num) public view returns (address deployer, address currentContractAddress)
    {
        DeployedContract memory c = deployedContracts[msg.sender][num];
        return (c.deployer, c.contractAddress);
    }

    function sendTokens(address _tokenAddress, address _toAddress) public onlyOwner {
        IERC20 token = IERC20(_tokenAddress);
        uint256 balance = token.balanceOf(address(this));
        require(balance > 0, "InsufficientBalance");
        token.safeTransfer(_toAddress, balance);
    }
    
    function sendAvax(address payable _addr) public onlyOwner {
        _addr.transfer(address(this).balance);
    }
}
