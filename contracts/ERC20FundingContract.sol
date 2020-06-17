pragma solidity ^0.5.11;

import "./AbstractFundingContract.sol";
import "./zeppelin/token/ERC20/IERC20.sol";

contract ERC20FundingContract is AbstractFundingContract {
    IERC20 public token; // Should use a safe transfer proxy?

    constructor(
        uint256 _numberOfPlannedPayouts,
        uint256 _withdrawPeriod,
        uint256 _campaignEndTime,
        uint256 _amountPerPayment,
        address payable _owner,
        address _tokenAddress,
        address _administrator
    )
        public
        AbstractFundingContract(
            _numberOfPlannedPayouts,
            _withdrawPeriod,
            _campaignEndTime,
            _amountPerPayment,
            _owner,
            _administrator
        )
    {
        require(_tokenAddress != address(0), "need a valid token address");
        token = IERC20(_tokenAddress);
    }

    function totalBalance(
        address payable /* owner */
    ) public view returns (uint256) {
        return token.balanceOf(address(this));
    }

    function doWithdraw(address payable owner, uint256 amount) internal {
        token.transfer(owner, amount);
    }

    function doDeposit(address donator, uint256 amount) internal {
        require(msg.value == 0, "No ETH allowed for ERC20 contract.");
        token.transferFrom(donator, address(this), amount);
    }

    function getPayoutAmount(
        uint256 balanceLeft,
        uint256 payoutsLeft,
        uint256 maxAmountPerPayment
    ) internal view returns (uint256) {
        if (maxAmountPerPayment == 0) {
            return balanceLeft / payoutsLeft;
        }
        if (balanceLeft >= maxAmountPerPayment) {
            return maxAmountPerPayment;
        }
        return balanceLeft;
    }
}
