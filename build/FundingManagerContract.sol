pragma solidity ^0.5.11;

contract Ownable {
    address payable public owner;

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

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

    function transfer(address recipient, uint256 amount)
        external
        returns (bool);

    function allowance(address owner, address spender)
        external
        view
        returns (uint256);

    function approve(address spender, uint256 amount) external returns (bool);

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);

    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
}

contract Destructible is Ownable {
    constructor() public payable {}

    function destroy() public onlyOwner {
        selfdestruct(owner);
    }

    function destroyAndSend(address payable _recipient) public onlyOwner {
        selfdestruct(_recipient);
    }
}

interface FundingContract {
    event PayoutWithdrawed(
        address toAddress,
        uint256 amount,
        address triggered
    );
    event NewDeposit(address from, uint256 amount);

    function owner() external view returns (address);

    function withdrawLimit() external view returns (uint256);

    function withdrawPeriod() external view returns (uint256);

    function lastWithdraw() external view returns (uint256);

    function canWithdraw() external view returns (bool);

    function cancelled() external view returns (bool);

    function totalNumberOfPayoutsLeft() external view returns (uint256);

    function withdraw() external;

    function deposit(address donator, uint256 amount) external;

    function paybackTokens(address payable originalPayee, uint256 amount)
        external;

    function toggleCancellation() external returns (bool);
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

    function splitShareCampaigns(
        address[] _campaigns,
        uint256 _campaignTopLimit
    ) external {
        uint256 campaignsCount = _campaigns.length;
        require(campaignsCount > 0, "NoContracts");

        IERC20 token = IERC20(tokenAddress);
        uint256 totalBalanceInContract = token.balanceOf(address(this));
        require(totalBalanceInContract > 0, "No Money Left");
        FundingLevel[50] memory fundings;
        uint256 counter = 0;
        uint256 totalMissingBalance;
        for (uint256 index = 0; index < campaignsCount; index += 1) {
            address currentContractAddress = _campaigns[index];
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
                        _campaignTopLimit - balanceOfContract
                    );
                    counter += 1;
                    totalMissingBalance + _campaignTopLimit - balanceOfContract;
                }
            }
        }

        for (
            uint256 fundingIndex = 0;
            fundingIndex < counter;
            fundingIndex += 1
        ) {
            FundingLevel memory level = fundings[fundingIndex];
            uint256 amountToPay = (totalBalanceInContract *
                level.requiredBalance) / totalMissingBalance;
            if (amountToPay + level.requiredBalance > _campaignTopLimit) {
                amountToPay = _campaignTopLimit - level.requiredBalance;
            }
            token.transfer(fundings[fundingIndex].campaign, amountToPay);
        }
    }

    function splitShareAmongCampaigns(uint256 _campaignTopLimit) external {
        DeploymentManager manager = DeploymentManager(deploymentManager);
        uint256 campaignsCount = manager.contractsCount(msg.sender);
        require(campaignsCount > 0, "NoContracts");

        IERC20 token = IERC20(tokenAddress);
        uint256 totalBalanceInContract = token.balanceOf(address(this));
        require(totalBalanceInContract > 0, "No Money Left");

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
                        _campaignTopLimit - balanceOfContract
                    );
                    counter += 1;
                    totalMissingBalance + _campaignTopLimit - balanceOfContract;
                }
            }
        }

        for (
            uint256 fundingIndex = 0;
            fundingIndex < counter;
            fundingIndex += 1
        ) {
            FundingLevel memory level = fundings[fundingIndex];
            uint256 amountToPay = (totalBalanceInContract *
                level.requiredBalance) / totalMissingBalance;
            if (amountToPay + level.requiredBalance > _campaignTopLimit) {
                amountToPay = _campaignTopLimit - level.requiredBalance;
            }
            token.transfer(fundings[fundingIndex].campaign, amountToPay);
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
        external
        view
        returns (address deployer, address currentContractAddress)
    {
        DeploymentManager manager = DeploymentManager(deploymentManager);
        return (manager.deployedContracts(msg.sender, num));
    }
}
