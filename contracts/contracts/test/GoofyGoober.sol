//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract GoofyGoober is ERC20 {
    uint constant _initial_supply = 1000000 * (10**6);
    constructor() ERC20("GoofyGoober", "GG") {
        _mint(msg.sender, _initial_supply);
    }

    function decimals() public view virtual override returns (uint8) {
        return 6;
    }
}