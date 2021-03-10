pragma solidity ^0.5.11;


interface FundingContract {
  
  event PayoutWithdrawed(address toAddress, uint256 amount, address triggered);
  event NewDeposit(address from, uint256 amount);

  
  
  function owner() external view returns (address);
  
  function withdrawLimit() external view returns(uint256);
  function withdrawPeriod() external view returns(uint256);
  function lastWithdraw() external view returns(uint256);
  function canWithdraw() external view returns(bool);
  function cancelled() external view returns (bool);
  function totalNumberOfPayoutsLeft() external view returns (uint256);

  
  
  function withdraw() external;
  function deposit(address donator, uint256 amount) external;
  function paybackTokens(address payable originalPayee, uint256 amount) external;
  function toggleCancellation() external returns(bool);
}

contract AdminControlled {
  address public contractAdmin;

  event ContractAdminTransferred(address indexed previousAdmin, address indexed newAdmin);

  constructor(address administrator) public {
    contractAdmin = administrator;
  }

  modifier onlyAdmin() {
    require(msg.sender == contractAdmin, 'Only contract administrator can perform this operation');
    _;
  }

  function transferContractAdmin(address newAdmin) public onlyAdmin {
    require(newAdmin != address(0), 'Need a valid admin');
    emit ContractAdminTransferred(contractAdmin, newAdmin);
    contractAdmin = newAdmin;
  }
}

contract AbstractFundingContract is FundingContract, AdminControlled {
    address payable public owner;
    uint256 public numberOfPlannedPayouts;
    uint256 public amountPerPayment;
    uint256 public withdrawPeriod;
    uint256 public lastWithdraw;
    bool public cancelled;
    uint256 public totalNumberOfPayoutsLeft;
    uint256 public withdrawLimit;

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

        
        lastWithdraw = _campaignEndTime;
    }

    function transferOwnership(address payable newOwner) public onlyAdmin {
        require(newOwner != address(0), 'Need a valid owner');
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function canWithdraw() public view returns (bool) {
        
        return now > lastWithdraw + withdrawPeriod;
    }

    
    
    function withdraw() external notCancelled {
        require(totalNumberOfPayoutsLeft > 0, "No withdraw left");
        require(canWithdraw(), "Not allowed to withdraw");
        uint256 leftBalance = totalBalance(owner);

        require(leftBalance > 0, "Insufficient funds");
        uint256 payoutAmount = getPayoutAmount(
            uint256(leftBalance),
            totalNumberOfPayoutsLeft,
            amountPerPayment
        );

        
        doWithdraw(owner, payoutAmount);
        totalNumberOfPayoutsLeft--;
        lastWithdraw = now;

        emit PayoutWithdrawed(owner, payoutAmount, msg.sender);
    }

    function toggleCancellation() external onlyAdmin returns (bool) {
        cancelled = !cancelled;
        return cancelled;
    }

    function paybackTokens(address payable originalPayee, uint256 amount)
        external
        isCancelled
        onlyAdmin
    {
        doWithdraw(originalPayee, amount);
    }

    function deposit(address donator, uint256 amount) external notCancelled {
        doDeposit(donator, amount);
        emit NewDeposit(donator, amount);
    }

    function totalBalance(
        address payable 
    ) public view returns (uint256) {
        revert("This must be implemented in the inheriting class");
    }

    function doWithdraw(
        address payable, 
        uint256 
    ) internal {
        revert("This must be implemented in the inheriting class");
    }

    function doDeposit(
        address, 
        uint256 
    ) internal {
        revert("This must be implemented in the inheriting class");
    }

    function getPayoutAmount(
        uint256 ,
        uint256 ,
        uint256 
    ) internal view returns (uint256) {
        revert("This must be implemented in the inheriting class");
    }
}

interface IERC20 {
    
    function totalSupply() external view returns (uint256);

    
    function balanceOf(address account) external view returns (uint256);

    
    function transfer(address recipient, uint256 amount) external returns (bool);

    
    function allowance(address owner, address spender) external view returns (uint256);

    
    function approve(address spender, uint256 amount) external returns (bool);

    
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);

    
    event Transfer(address indexed from, address indexed to, uint256 value);

    
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

library SafeMath {
    
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");

        return c;
    }

    
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        return sub(a, b, "SafeMath: subtraction overflow");
    }

    
    function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b <= a, errorMessage);
        uint256 c = a - b;

        return c;
    }

    
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        
        
        
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");

        return c;
    }

    
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return div(a, b, "SafeMath: division by zero");
    }

    
    function div(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        
        require(b > 0, errorMessage);
        uint256 c = a / b;
        

        return c;
    }

    
    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        return mod(a, b, "SafeMath: modulo by zero");
    }

    
    function mod(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b != 0, errorMessage);
        return a % b;
    }
}

library Address {
    
    function isContract(address account) internal view returns (bool) {
        
        
        

        
        
        
        bytes32 codehash;
        bytes32 accountHash = 0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470;
        
        assembly { codehash := extcodehash(account) }
        return (codehash != 0x0 && codehash != accountHash);
    }

    
    function toPayable(address account) internal pure returns (address payable) {
        return address(uint160(account));
    }

    
    function sendValue(address payable recipient, uint256 amount) internal {
        require(address(this).balance >= amount, "Address: insufficient balance");

        
        (bool success, ) = recipient.call.value(amount)("");
        require(success, "Address: unable to send value, recipient may have reverted");
    }
}

library SafeERC20 {
    using SafeMath for uint256;
    using Address for address;

    function safeTransfer(IERC20 token, address to, uint256 value) internal {
        callOptionalReturn(token, abi.encodeWithSelector(token.transfer.selector, to, value));
    }

    function safeTransferFrom(IERC20 token, address from, address to, uint256 value) internal {
        callOptionalReturn(token, abi.encodeWithSelector(token.transferFrom.selector, from, to, value));
    }

    function safeApprove(IERC20 token, address spender, uint256 value) internal {
        
        
        
        
        require((value == 0) || (token.allowance(address(this), spender) == 0),
            "SafeERC20: approve from non-zero to non-zero allowance"
        );
        callOptionalReturn(token, abi.encodeWithSelector(token.approve.selector, spender, value));
    }

    function safeIncreaseAllowance(IERC20 token, address spender, uint256 value) internal {
        uint256 newAllowance = token.allowance(address(this), spender).add(value);
        callOptionalReturn(token, abi.encodeWithSelector(token.approve.selector, spender, newAllowance));
    }

    function safeDecreaseAllowance(IERC20 token, address spender, uint256 value) internal {
        uint256 newAllowance = token.allowance(address(this), spender).sub(value, "SafeERC20: decreased allowance below zero");
        callOptionalReturn(token, abi.encodeWithSelector(token.approve.selector, spender, newAllowance));
    }

    
    function callOptionalReturn(IERC20 token, bytes memory data) private {
        
        

        
        
        
        
        
        require(address(token).isContract(), "SafeERC20: call to non-contract");

        
        (bool success, bytes memory returndata) = address(token).call(data);
        require(success, "SafeERC20: low-level call failed");

        if (returndata.length > 0) { 
            
            require(abi.decode(returndata, (bool)), "SafeERC20: ERC20 operation did not succeed");
        }
    }
}

contract ERC20FundingContract is AbstractFundingContract {
    using SafeERC20 for IERC20;
    IERC20 public token; 

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
        address payable 
    ) public view returns (uint256) {
        return token.balanceOf(address(this));
    }

    function doWithdraw(address payable owner, uint256 amount) internal {
        token.safeTransfer(owner, amount);
    }

    function doDeposit(address donator, uint256 amount) internal {
        require(msg.value == 0, "No ETH allowed for ERC20 contract.");
        token.safeTransferFrom(donator, address(this), amount);
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