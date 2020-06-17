pragma solidity ^0.5.11;
import "./FundingContract.sol";

interface Deployer {
    function deploy(
        uint256 _numberOfPlannedPayouts,
        uint256 _withdrawPeriod,
        uint256 _campaignEndTime,
        uint256 _amountPerPayment,
        address payable __owner,
        address _tokenAddress,
        address _adminAddress
    ) external returns (FundingContract c);
}
