pragma solidity >=0.6.0 <0.8.0;

import "./ERC20FundingContract.sol";
import "./FundingContract.sol";
import "./Deployer.sol";


contract FundingContractDeployer is Deployer {
    function deploy(
        uint256 _numberOfPlannedPayouts,
        uint256 _withdrawPeriod,
        uint256 _campaignEndTime,
        uint256 _amountPerPayment,
        address payable __owner,
        address _tokenAddress,
        address _adminAddress
    ) external override returns (FundingContract c) {
        c = new ERC20FundingContract(
            _numberOfPlannedPayouts,
            _withdrawPeriod,
            _campaignEndTime,
            _amountPerPayment,
            __owner,
            _tokenAddress,
            _adminAddress
        );
    }
}
