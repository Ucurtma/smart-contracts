pragma solidity ^0.5.11;

import "./zeppelin/lifecycle/Destructible.sol";
import "./zeppelin/ownership/Ownable.sol";
import "./DeploymentManager.sol";
import "./FundingContract.sol";

contract FundingManagerContract is Ownable, Destructible {
    address public deploymentManager;
    mapping(address => bool) public skippedCampaigns;

    constructor(address payable _owner, address _deploymentManager) public {
        require(_owner != address(0), "AddressNotNull");
        owner = _owner;
        deploymentManager = _deploymentManager;
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
            if (campaign.canWithdraw()) {
                campaign.withdraw();
            }
        }
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
