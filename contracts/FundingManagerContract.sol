pragma solidity ^0.5.11;

import "./zeppelin/ownership/Ownable.sol";
import "./zeppelin/token/ERC20/IERC20.sol";
import "./DeploymentManager.sol";
import "./FundingContract.sol";

contract FundingManagerContract is Ownable {
    event SplitSharedFunds(
        address[] indexed addresses,
        uint256 indexed totalSpent
    );

    struct FundingLevel {
        address campaign;
        uint256 requiredBalance;
    }

    address public deploymentManager;
    address public tokenAddress;

    constructor(address _deploymentManager, address _tokenAddress) public {
        owner = msg.sender;
        deploymentManager = _deploymentManager;
        tokenAddress = _tokenAddress;
    }

    function updateDeploymentManager(address _deploymentManager)
        external
        onlyOwner
    {
        require(_deploymentManager != address(0), "AddressNotNull");
        deploymentManager = _deploymentManager;
    }

    function payoutToCampaigns() external {
        DeploymentManager manager = DeploymentManager(deploymentManager);
        uint256 campaignsCount = manager.contractsCount(msg.sender);
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

    function splitShareCampaigns(
        uint256 _campaignTopLimit,
        address[] calldata _campaigns
    ) external {
        uint256 campaignsCount = _campaigns.length;
        require(campaignsCount > 0, "NoContracts");

        IERC20 token = IERC20(tokenAddress);

        FundingLevel[25] memory fundings;
        uint256 counter = 0;
        uint256 totalBalanceNeed;
        for (uint256 index = 0; index < campaignsCount; index += 1) {
            address currentContractAddress = _campaigns[index];
            uint256 balanceOfContract = token.balanceOf(currentContractAddress);
            if (
                currentContractAddress != address(0) &&
                _campaignTopLimit > balanceOfContract
            ) {
                FundingContract campaign = FundingContract(
                    currentContractAddress
                );
                if (
                    !campaign.cancelled() &&
                    campaign.totalNumberOfPayoutsLeft() > 0
                ) {
                    fundings[counter] = FundingLevel(
                        currentContractAddress,
                        _campaignTopLimit - balanceOfContract
                    );
                    counter += 1;
                    totalBalanceNeed += _campaignTopLimit - balanceOfContract;
                }
            }
        }
        uint256 totalBalanceInContract = token.balanceOf(address(this));
        require(totalBalanceInContract > 0, "NoMoneyLeft");
        uint256 spentAmount = 0;
        for (
            uint256 fundingIndex = 0;
            fundingIndex < counter;
            fundingIndex += 1
        ) {
            FundingLevel memory level = fundings[fundingIndex];
            uint256 amountToPay = (totalBalanceInContract *
                level.requiredBalance) / totalBalanceNeed;
            if (amountToPay > level.requiredBalance) {
                amountToPay = level.requiredBalance;
            }
            token.transfer(fundings[fundingIndex].campaign, amountToPay);
            spentAmount += amountToPay;
        }
        emit SplitSharedFunds(_campaigns, spentAmount);
    }

    function destroyAndSend() external onlyOwner {
        destroyAndSend(tokenAddress);
    }

    function sendTokens(address _tokenAddress, address _toAddress)
        public
        onlyOwner
    {
        IERC20 token = IERC20(_tokenAddress);
        uint256 balance = token.balanceOf(address(this));
        require(balance > 0, "InsufficientBalance");
        token.transfer(_toAddress, balance);
    }

    function destroyAndSend(address _tokenAddress) public onlyOwner {
        sendTokens(_tokenAddress, owner);
        selfdestruct(owner);
    }

    function getCampaign(uint256 num)
        public
        view
        returns (address deployer, address currentContractAddress)
    {
        DeploymentManager manager = DeploymentManager(deploymentManager);
        return (manager.deployedContracts(msg.sender, num));
    }
}
