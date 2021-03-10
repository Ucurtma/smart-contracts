pragma solidity ^0.5.11;


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

contract Destructible is Ownable {

  constructor() public payable { }

  
  function destroy() public onlyOwner {
    selfdestruct(owner);
  }

  function destroyAndSend(address payable _recipient) public onlyOwner {
    selfdestruct(_recipient);
  }
}

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

contract DeploymentManager is Destructible {
    struct DeployedContract {
        address deployer;
        address contractAddress;
    }

    modifier isAllowedUser() {
        require(
            allowedUsers[msg.sender] == true,
            "You are not allowed to deploy a campaign."
        );
        _;
    }

    Deployer erc20Deployer;
    

    mapping(address => bool) public allowedUsers;
    mapping(address => DeployedContract[]) public deployedContracts;
    mapping(address => uint256) public contractsCount;

    constructor(address _erc20Deployer) public {
        erc20Deployer = Deployer(_erc20Deployer);
        allowedUsers[msg.sender] = true;
    }

    event NewFundingContract(
        address indexed deployedAddress,
        address indexed deployer
    );

    function updateERC20Deployer(address _erc20Deployer) external onlyOwner {
        erc20Deployer = Deployer(_erc20Deployer);
    }

    function updateAllowedUserPermission(address _user, bool _isAllowed)
        external
        onlyOwner
    {
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
}

contract FundingManagerContract is Ownable {
    using SafeERC20 for IERC20;

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
            token.safeTransfer(fundings[fundingIndex].campaign, amountToPay);
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
        token.safeTransfer(_toAddress, balance);
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