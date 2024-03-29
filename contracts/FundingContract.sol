pragma solidity >=0.6.0 <0.8.0;

// import "@openzeppelin/upgrades/contracts/Initializable.sol";
// import "@openzeppelin/contracts/lifecycle/Pausable.sol";
// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
/*
Payment:
  Someone sends token to contract

Student:
  Deploy contract
  Can only withdraw once in X (withdrawPeriod)
*/

interface FundingContract {
  // Events
  event PayoutWithdrawed(address toAddress, uint256 amount, address triggered);
  event NewDeposit(address from, uint256 amount);

  // Variables
  // Ownable
  function owner() external view returns (address payable);
  // AbstractFundingContract
  function withdrawLimit() external view returns(uint256);
  function withdrawPeriod() external view returns(uint256);
  function lastWithdraw() external view returns(uint256);
  function canWithdraw() external view returns(bool);
  function cancelled() external view returns (bool);
  function totalNumberOfPayoutsLeft() external view returns (uint256);

  // Functions
  // AbstractFundingContract
  function withdraw() external;
  function deposit(address donator, uint256 amount) external;
  function paybackTokens(address payable originalPayee, uint256 amount) external;
  function toggleCancellation() external returns(bool);
}
