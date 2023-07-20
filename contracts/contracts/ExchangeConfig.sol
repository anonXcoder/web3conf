// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract ExchangeConfig {
    struct ProcessingTimeSecs {
        uint256 buyMin;
        uint256 buyMax;
        uint256 sellMin;
        uint256 sellMax;
    }
    bool public exchangeStatus;
    uint256 public buyINRPrice;
    uint256 public sellINRPrice;
    mapping(address => bool) public admins;
    uint256 public limitPerTxn;
    ProcessingTimeSecs public processingTime;

    event UpdatedExchangeStatus(address admin, bool currStatus, bool updatedStatus);
    event BuyPriceUpdated(address admin, uint256 currExchangeINRPrice, uint256 updatedExchangeINRPrice);
    event SellPriceUpdated(address admin, uint256 currExchangeINRPrice, uint256 updatedExchangeINRPrice);
    event LimitPerTxUpdated(address admin, uint256 currLimit, uint256 updatedLimit);
    event ProcessingTimeUpdated(address admin, ProcessingTimeSecs currTime, ProcessingTimeSecs updatedTime);

    modifier onlyAdmin() {
        require(admins[msg.sender] == true, "Not admin");
        _;
    }

    constructor(address[] memory _admins, uint256 _buyINRPrice, uint256 _sellINRPrice, uint256 _limitPerTxn, ProcessingTimeSecs memory _processingTime) {
        for (uint256 i = 0; i < _admins.length; i++) {
            admins[_admins[i]] = true;
        }

        exchangeStatus = true;
        buyINRPrice = _buyINRPrice;
        sellINRPrice = _sellINRPrice;
        limitPerTxn = _limitPerTxn;
        processingTime = _processingTime;
    }

    /**
     * @dev Toggles the exchange status and emits the UpdatedExchangeStatus event.
     */
    function toggleExchangeStatus() public onlyAdmin {
        emit UpdatedExchangeStatus(msg.sender, exchangeStatus, !exchangeStatus);
        exchangeStatus = !exchangeStatus;
    }

    /**
     * @dev Sets the buyINRPrice and emits the BuyPriceUpdated event.
     * @param _buyINRPrice The new price to set for buying USDT.
     */
    function setBuyPrice(uint256 _buyINRPrice) public onlyAdmin {
        emit BuyPriceUpdated(msg.sender, buyINRPrice, _buyINRPrice);
        buyINRPrice = _buyINRPrice;
    }

    /**
     * @dev Sets the sellINRPrice and emits the SellPriceUpdated event.
     * @param _sellINRPrice The new price to set for sellingINR.
     */
    function setSellPrice(uint256 _sellINRPrice) public onlyAdmin {
        emit SellPriceUpdated(msg.sender, sellINRPrice, _sellINRPrice);
        sellINRPrice = _sellINRPrice;
    }

    /**
     * @dev Returns a boolean indicating if an address is an admin.
     * @param _admin The address to check for admin privileges.
     */
    function isAdmin(address _admin) public view returns (bool) {
        return admins[_admin];
    }

    /**
     * @dev Adds or removes an admin address.
     * @param _admin The address to add or remove.
     * @param _status The new admin status. True to add, false to remove.
     */
    function updateAdmin(address _admin, bool _status) public onlyAdmin {
        require(_admin != address(0), "Invalid address");
        require(_admin != msg.sender, "Cannot change own admin status");
        admins[_admin] = _status;
    }

    function updateLimitPerTxn(uint256 _limitPerTxn) public onlyAdmin {
        emit LimitPerTxUpdated(msg.sender, limitPerTxn, _limitPerTxn);
        limitPerTxn = _limitPerTxn;
    }

    function updateProcessingTime(ProcessingTimeSecs memory _processingTime) public onlyAdmin {
        emit ProcessingTimeUpdated(msg.sender, processingTime, _processingTime);
        processingTime = _processingTime;
    }
}
