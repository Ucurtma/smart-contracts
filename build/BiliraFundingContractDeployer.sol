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

contract Ownable {
  address payable public owner;


  event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);


  
  constructor() public {
    owner = msg.sender;
  }


  
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }


  
  function transferOwnership(address payable newOwner) public onlyOwner {
    require(newOwner != address(0));
    emit OwnershipTransferred(owner, newOwner);
    owner = newOwner;
  }

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

contract AbstractFundingContract is FundingContract, Ownable, AdminControlled {
    uint256 public numberOfPlannedPayouts;
    uint256 public withdrawPeriod;
    uint256 public lastWithdraw;
    bool public cancelled;
    uint256 public totalNumberOfPayoutsLeft;
    uint256 public withdrawLimit;

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

        
        lastWithdraw = _campaignEndTime;
    }

    function canWithdraw() public view returns (bool) {
        
        return now > lastWithdraw + withdrawPeriod;
    }

    
    
    function withdraw() external notCancelled {
        require(canWithdraw(), "Not allowed to withdraw");
        uint256 leftBalance = totalBalance(owner);

        require(leftBalance > 0, "Insufficient funds");
        uint256 payoutAmount = uint256(leftBalance) / totalNumberOfPayoutsLeft;

        
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

contract ERC20FundingContract is AbstractFundingContract {

  IERC20 public token; 

  constructor(
    uint256 _numberOfPlannedPayouts,
    uint256 _withdrawPeriod,
    uint256 _campaignEndTime,
    address payable _owner,
    address _tokenAddress,
    address _administrator
  )
    AbstractFundingContract(_numberOfPlannedPayouts, _withdrawPeriod, _campaignEndTime, _owner, _administrator)
    public {
      require(_tokenAddress != address(0), 'need a valid token address');
      token = IERC20(_tokenAddress);
  }

  function totalBalance(address payable ) public view returns (uint256) {
    return token.balanceOf(address(this));
  }

  function doWithdraw(address payable owner, uint256 amount) internal {
    token.transfer(owner, amount);
  }

  function doDeposit(address donator, uint256 amount) internal {
    require(msg.value == 0, 'No ETH allowed for ERC20 contract.');
    token.transferFrom(donator, address(this), amount);
  }
}

interface Deployer {
    function deploy(
        uint256 _numberOfPlannedPayouts,
        uint256 _withdrawPeriod,
        uint256 _campaignEndTime,
        address payable __owner,
        address _tokenAddress,
        address _adminAddress
    )external returns(FundingContract c);
}

contract BiliraFundingContractDeployer is Deployer {
    function deploy(
        uint256 _numberOfPlannedPayouts,
        uint256 _withdrawPeriod,
        uint256 _campaignEndTime,
        address payable __owner,
        address _tokenAddress,
        address _adminAddress
    ) external returns (FundingContract c) {
        c = new ERC20FundingContract(
            _numberOfPlannedPayouts,
            _withdrawPeriod,
            _campaignEndTime,
            __owner,
            _tokenAddress,
            _adminAddress
        );
    }
}