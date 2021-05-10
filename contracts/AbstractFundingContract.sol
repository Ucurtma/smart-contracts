pragma solidity >=0.6.0 <0.8.0;

import "./FundingContract.sol";
import "./openzeppelin/AdminControlled.sol";

contract AbstractFundingContract is FundingContract, AdminControlled {
    address payable public override owner;
    uint256 public numberOfPlannedPayouts;
    uint256 public amountPerPayment;
    uint256 public override withdrawPeriod;
    uint256 public override lastWithdraw;
    bool public override cancelled;
    uint256 public override totalNumberOfPayoutsLeft;
    uint256 public override withdrawLimit;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier notCancelled {
        require(!cancelled, "Campaign is cancelled");
        _;
    }

    modifier isCancelled {
        require(cancelled, "Campaign should be cancelled");
        _;
    }

    constructor(
        uint256 _numberOfPlannedPayouts,
        uint256 _withdrawPeriod,
        uint256 _campaignEndTime,
        uint256 _amountPerPayment,
        address payable __owner,
        address _administrator
    ) public AdminControlled(_administrator) {
        require(_numberOfPlannedPayouts > 0, "Invalid number of payouts");
        require(__owner != address(0), "Contract must have owner");
        require(
            _administrator != address(0),
            "Contract must have an initial admin"
        );

        numberOfPlannedPayouts = _numberOfPlannedPayouts;
        withdrawPeriod = _withdrawPeriod;
        owner = __owner;
        totalNumberOfPayoutsLeft = numberOfPlannedPayouts;
        amountPerPayment = _amountPerPayment;

        // consider the last withdraw date is the last day of campaign
        lastWithdraw = _campaignEndTime;
    }

    function transferOwnership(address payable newOwner) public onlyAdmin {
        require(newOwner != address(0), 'Need a valid owner');
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function canWithdraw() public view override returns (bool) {
        // Check when was the last time the withdraw happened, and add withdraw period.
        return block.timestamp > lastWithdraw + withdrawPeriod;
    }

    // Functions
    // AbstractFundingContract
    function withdraw() external override notCancelled {
        require(totalNumberOfPayoutsLeft > 0, "No withdraw left");
        require(canWithdraw(), "Not allowed to withdraw");
        uint256 leftBalance = totalBalance(owner);

        require(leftBalance > 0, "Insufficient funds");
        uint256 payoutAmount = getPayoutAmount(
            uint256(leftBalance),
            totalNumberOfPayoutsLeft,
            amountPerPayment
        );

        // withdraw money and make the transfer to the owner.
        doWithdraw(owner, payoutAmount);
        totalNumberOfPayoutsLeft--;
        lastWithdraw = block.timestamp;

        emit PayoutWithdrawed(owner, payoutAmount, msg.sender);
    }

    function toggleCancellation() external override onlyAdmin returns (bool) {
        cancelled = !cancelled;
        return cancelled;
    }

    function paybackTokens(address payable originalPayee, uint256 amount)
        external
        override
        isCancelled
        onlyAdmin
    {
        doWithdraw(originalPayee, amount);
    }

    function deposit(address donator, uint256 amount) external override notCancelled {
        doDeposit(donator, amount);
        emit NewDeposit(donator, amount);
    }

    function totalBalance(
        address payable /* owner */
    ) public view virtual returns (uint256) {
        revert("This must be implemented in the inheriting class");
    }

    function doWithdraw(
        address payable, /* owner */
        uint256 /* amount */
    ) internal virtual {
        revert("This must be implemented in the inheriting class");
    }

    function doDeposit(
        address, /* donator */
        uint256 /* amount */
    ) internal virtual {
        revert("This must be implemented in the inheriting class");
    }

    function getPayoutAmount(
        uint256 /* leftBalance */,
        uint256 /* totalNumberOfPayoutsLeft */,
        uint256 /* amountPerPayment */
    ) internal view virtual returns (uint256) {
        revert("This must be implemented in the inheriting class");
    }
}
