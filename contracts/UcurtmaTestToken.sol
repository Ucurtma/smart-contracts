pragma solidity >=0.6.0 <0.8.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract UcurtmaTestToken is ERC20 {
    string private _name = 'Ucurtma Test Token';
    string private _symbol = 'TRYu';
    uint8 private _decimals = 6;

    constructor() ERC20( _name, _symbol) public {
        address account = msg.sender;
        uint value = 1000000 ** uint(_decimals);
        _mint(account, value);
    }
}
