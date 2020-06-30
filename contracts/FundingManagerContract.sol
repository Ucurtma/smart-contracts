pragma solidity ^0.5.11;

import "./zeppelin/ownership/Ownable.sol";
import "./zeppelin/token/ERC20/IERC20.sol";
import "./DeploymentManager.sol";
import "./FundingContract.sol";
import "./zeppelin/math/SafeMath.sol";

contract FundingManagerContract is Ownable {
    using SafeMath for uint256;

    struct FundingLevel {
        address campaign;
        uint256 requiredBalance;
    }

    address public deploymentManager;
    mapping(address => bool) public skippedCampaigns;
    address public tokenAddress;

    constructor(address _deploymentManager, address _tokenAddress) public {
        owner = msg.sender;
        deploymentManager = _deploymentManager;
        tokenAddress = _tokenAddress;
    }

    function addSkipContract(address _campaignAddress) external onlyOwner {
        require(_campaignAddress != address(0), "AddressNotNull");
        skippedCampaigns[_campaignAddress] = true;
    }

    function removeSkipContract(address _campaignAddress) external onlyOwner {
        require(_campaignAddress != address(0), "AddressNotNull");
        skippedCampaigns[_campaignAddress] = false;
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

        for (uint256 index = 0; index < campaignsCount; index += 1) {
            (, address currentContractAddress) = getCampaign(index);
            FundingContract campaign = FundingContract(currentContractAddress);
            if (campaign.canWithdraw() && !campaign.cancelled()) {
                campaign.withdraw();
            }
        }
    }

    function splitShareAmongCampaigns(uint256 _campaignTopLimit) public {
        DeploymentManager manager = DeploymentManager(deploymentManager);
        uint256 campaignsCount = manager.contractsCount(msg.sender);
        require(campaignsCount > 0, "NoContracts");

        IERC20 token = IERC20(tokenAddress);
        FundingLevel[50] memory fundings;
        uint256 counter = 0;
        uint256 totalMissingBalance;

        for (uint256 index = 0; index < campaignsCount; index += 1) {
            (, address currentContractAddress) = getCampaign(index);
            uint256 balanceOfContract = token.balanceOf(currentContractAddress);
            if (
                currentContractAddress != address(0) &&
                !skippedCampaigns[currentContractAddress] &&
                _campaignTopLimit > balanceOfContract
            ) {
                FundingContract campaign = FundingContract(
                    currentContractAddress
                );
                if (!campaign.cancelled()) {
                    fundings[counter] = FundingLevel(
                        currentContractAddress,
                        _campaignTopLimit.sub(balanceOfContract)
                    );
                    counter.add(1);
                    totalMissingBalance.add(
                        _campaignTopLimit.sub(balanceOfContract)
                    );
                }
            }
        }
        uint256 totalBalanceInContract = token.balanceOf(address(this));
        for (
            uint256 fundingIndex = 0;
            fundingIndex < counter;
            fundingIndex += 1
        ) {
            FundingLevel memory level = fundings[fundingIndex];
            uint256 amountPerCampaign = totalBalanceInContract
                .mul(level.requiredBalance)
                .div(totalMissingBalance);
            token.transfer(fundings[fundingIndex].campaign, amountPerCampaign);
        }
    }

    function destroyAndSend() external onlyOwner {
        destroyAndSend(tokenAddress);
    }

    function destroyAndSend(address _tokenAddress) public onlyOwner {
        IERC20 token = IERC20(_tokenAddress);
        uint256 balance = token.balanceOf(address(this));
        if (balance > 0) {
            token.transfer(owner, balance);
        }
        selfdestruct(owner);
    }

    function getCampaign(uint256 num)
        internal
        view
        returns (address deployer, address currentContractAddress)
    {
        DeploymentManager manager = DeploymentManager(deploymentManager);
        return (manager.deployedContracts(msg.sender, num));
    }
}
