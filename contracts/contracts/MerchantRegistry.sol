// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import { ExchangeConfig } from './ExchangeConfig.sol';
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// The BrokerFactory contract manages the listing of brokers and their associated escrow contracts.
contract MerchantRegistry {

	// BrokerLimits struct contains the minimum and maximum limits for buy and sell orders.
    struct BrokerLimits {
        uint256 minUsdt;
        uint256 maxUsdt;
        uint256 minInr;
        uint256 maxInr;
    }

    // Broker struct contains the information about a broker, including their limits and UPI details.
    struct Broker {
        string pubKey;
        address escrow;
        address addr;
        bool active;
        BrokerLimits limits;
    }

    // Order struct contains the information about an order, including its status and type.
    struct Order {
        address broker;
        address user;
        address recipientAddr;
        string pubkey;
        string encUpi;
        uint256 amount; // USDT amount
        uint256 inrAmount; // INR amount
        uint256 placedTimestamp;
        uint256 completedTimestamp;
        OrderStatus status;
        OrderType orderType;
        uint256 id;
    }

    // OrderStatus enum represents the possible statuses of an order.
    enum OrderStatus{ PLACED, ACCEPTED, PAID, COMPLETED } // Do we want disputed or cancelled?

    // OrderType enum represents the types of orders: BUY or SELL.
    enum OrderType{ BUY, SELL }

    // The exchangeConfig is an instance of the ExchangeConfig contract.
    ExchangeConfig public exchangeConfig;

    // Mapping to store broker information by their address.
    mapping(address => Broker) public brokers;

    // Mapping to store order information by their ID.
    mapping(uint256 => Order) public orders;

    // Mapping to store order ids for a specific user.
    mapping(address => uint256[]) public userOrders;
    mapping(address => uint256) public userOrdersLen;

    // Mapping to store order ids for a specific broker.
    mapping(address => uint256[]) public brokerOrders;

    // Mapping to store commitments by a specific broker.
    mapping(address => uint256) public commitments;

    // The nextOrderId is an auto-incrementing ID for new orders.
    uint256 nextOrderId;
    mapping(uint256 => address) public brokerIdAddress;
    uint256 nextBrokerId;
    uint256 nextBrokerToAllocate;

    address public usdtAddress;

	event ListedBroker(address admin, Broker broker);
	event EnabledBroker(address admin, address broker);
	event DisabledBroker(address admin, address broker);
	event UpdatedBrokerLimits(address broker, BrokerLimits limits);
	event DeployedEscrow(address broker, address escrow);
	event OrderPlaced(address user, address broker, uint256 orderId, Order order);
	event OrderAccepted(address indexed user, address indexed broker, uint256 orderId, Order order);
	event OrderPaid(address user, address broker, uint256 orderId, Order order);
	event OrderComplete(address indexed user, address indexed broker, uint256 orderId, Order order);


	modifier onlyOwner() {
		require(exchangeConfig.isAdmin(msg.sender) == true, "Not admin");
    	_;
  	}

  	modifier exchangeActive() {
		require(exchangeConfig.exchangeStatus() == true, "Exchange not operational atm");
    	_;
  	}

	modifier txnAmountValid (uint256 _amount) {
		require(exchangeConfig.limitPerTxn() >= _amount, "Amount exceeds exchange limit!");
    	_;
	}

	constructor(address _exchangeConfig, address _usdtAddress) {
		exchangeConfig = ExchangeConfig(_exchangeConfig);
		usdtAddress = _usdtAddress;
	}

	function userOrdersArr(address _user) public view returns(Order[] memory) {
		uint256 len = userOrdersLen[_user];
		require(len > 0, "No orders to return!");

		Order[] memory _orders = new Order[](len);
		uint256[] memory orderIds = userOrders[_user];
		for (uint256 i=0; i<len; i++) {
			_orders[i] = orders[orderIds[i]];
		}

		return _orders;
	}

	function listBroker(Broker memory _broker) public onlyOwner {
	    require(_broker.addr != address(0), "Invalid broker address");
	    require(brokers[_broker.addr].addr == address(0), "Broker already listed");

	    Broker storage newBroker = brokers[_broker.addr];
	    newBroker.pubKey = _broker.pubKey;
	    newBroker.addr = _broker.addr;
	    newBroker.active = _broker.active;
	    newBroker.limits = _broker.limits;
	    newBroker.escrow = _broker.escrow;

	    brokerIdAddress[nextBrokerId] = _broker.addr;
	    nextBrokerId++;

	    emit ListedBroker(msg.sender, _broker);
	}

	function enableBroker(address _brokerAddr) public onlyOwner {
	    require(_brokerAddr != address(0), "Invalid broker address");
	    require(brokers[_brokerAddr].addr != address(0), "Broker not listed");
	    require(brokers[_brokerAddr].active == false, "Broker already active");

	    brokers[_brokerAddr].active = true;
	    emit EnabledBroker(msg.sender, _brokerAddr);
	}

	function disableBroker(address _brokerAddr) public onlyOwner {
	    require(_brokerAddr != address(0), "Invalid broker address");
	    require(brokers[_brokerAddr].addr != address(0), "Broker not listed");
	    require(brokers[_brokerAddr].active == true, "Broker already inactive");

	    brokers[_brokerAddr].active = false;
	    emit DisabledBroker(msg.sender, _brokerAddr);
	}

	function updateBrokerLimits(address _brokerAddr, BrokerLimits memory _limits) public onlyOwner {
	    require(_brokerAddr != address(0), "Invalid broker address");
	    require(_limits.minUsdt > 0 && _limits.maxUsdt > _limits.minUsdt, "Invalid usdt amount limits");
	    require(_limits.minInr > 0 && _limits.maxInr > _limits.minInr, "Invalid inr amount limits");

	    brokers[_brokerAddr].limits = _limits;
	    emit UpdatedBrokerLimits(_brokerAddr, _limits);
	}

	function fetchBrokerForOrder() public view returns(Broker memory) {
		uint256 _nextBrokerToAllocate = nextBrokerToAllocate;
		address brokerAdd = brokerIdAddress[_nextBrokerToAllocate];
		Broker memory _broker = brokers[brokerAdd];
		bool roundComplete = false;

		while (!_broker.active) {
			_nextBrokerToAllocate++;
			if (!roundComplete && _nextBrokerToAllocate >= nextBrokerId) {
				_nextBrokerToAllocate = 0;
				roundComplete = true;
			}
			brokerAdd = brokerIdAddress[_nextBrokerToAllocate];
			_broker = brokers[brokerAdd];

			if (brokerAdd == address(0)) {
				break;
			}
		}
		return brokers[brokerAdd];
	}

	function placeOrder(
		address _brokerAddr,
		string memory _pubKey,
		uint256 _amount,
		address _recipientAddr,
		OrderType _orderType,
		string memory _userUpi
	) public exchangeActive txnAmountValid(_amount) {
	    // Load broker data from the given broker address
	    Broker memory _broker = brokers[_brokerAddr];

	    // Ensure the broker is active, has an escrow deployed, and has UPI IDs attached
	    require(_broker.active == true, "Broker inactive");
	    require(_broker.escrow != address(0), "Escrow not set");

	    // Check if the broker's escrow has sufficient funds available for the order
	    // bool fundsAvailable = (IERC20(usdtAddress).balanceOf(_broker.escrow) - commitments[_broker.escrow]) > _amount;
	    // require(fundsAvailable == true, "Funds not available on escrow to fulfill the order");

	    // Set commitment on the escrow for the user
	    if (_orderType == OrderType.BUY) {
	    	commitments[_broker.escrow] += _amount;
	    }

	    userOrders[msg.sender].push(nextOrderId);
	    brokerOrders[_brokerAddr].push(nextOrderId);
	    userOrdersLen[msg.sender] = userOrdersLen[msg.sender] + 1;

	    // Create the new order


	    // Add the order to the orders mapping and increment the nextOrderId
	    if (_orderType == OrderType.BUY) {
	    	uint256 _inrAmount = (_amount * exchangeConfig.buyINRPrice()) / 1000000;
    		orders[nextOrderId] = Order(_brokerAddr, msg.sender, _recipientAddr, _pubKey, "", _amount, _inrAmount, block.timestamp, 0, OrderStatus.PLACED, _orderType, nextOrderId);
    	} else {
    		uint256 _inrAmount = (_amount * exchangeConfig.sellINRPrice()) / 1000000;
    		orders[nextOrderId] = Order(_brokerAddr, msg.sender, address(0), "", _userUpi, _amount, _inrAmount, block.timestamp, 0, OrderStatus.PLACED, _orderType, nextOrderId);
    	}
		nextBrokerToAllocate++;
		if (nextBrokerToAllocate >= nextBrokerId) nextBrokerToAllocate = 0;
	    emit OrderPlaced(msg.sender, _brokerAddr, nextOrderId, orders[nextOrderId]);
	    nextOrderId++;
	}

	function acceptBuyOrder(uint256 _orderId, string memory _userEncUpi) public {
	    // Load the order data from the given order ID
	    Order storage _order = orders[_orderId];

	    // Ensure that the message sender is the broker for the order and order was placed
	    require(_order.broker == msg.sender, "Not authorised");
	    require(_order.status == OrderStatus.PLACED, "Order not placed to be accepted");

        _order.encUpi = _userEncUpi;

	    // Update the order status to ACCEPTED and emit the OrderAccepted event
	    _order.status = OrderStatus.ACCEPTED;
	    emit OrderAccepted(_order.user, _order.broker, _orderId, _order);
	}

	function paidBuyOrder(uint256 _orderId) public {
	    // Load the order data from the given order ID
	    Order memory _order = orders[_orderId];

	    // Ensure that the message sender is the user who placed the order
	    require(_order.user == msg.sender, "Not authorised");

	    // Ensure that the order type is BUY and status is ACCEPTED
	    require(_order.orderType == OrderType.BUY, "Order type incorrect");
	    require(_order.status == OrderStatus.ACCEPTED, "Order is not accepted");

	    // Update the order status to PAID and store the updated status in the orders mapping
	    _order.status = OrderStatus.PAID;
	    orders[_orderId].status = _order.status;

	    // Emit the OrderPaid event
	    emit OrderPaid(msg.sender, _order.broker, _orderId, _order);
	}

	function completeOrder(uint256 _orderId) public {
	    Order storage _order = orders[_orderId];

	    // Ensure that the broker is authorized and the order has a PAID status
	    require(_order.broker == msg.sender || exchangeConfig.isAdmin(msg.sender), "Not authorised");
	    if (_order.orderType == OrderType.BUY) {
	    	require(_order.status == OrderStatus.PAID, "Only paid buy orders can be marked complete");
	    } else {
	    	require(_order.status == OrderStatus.PLACED, "Only placed sell orders can be marked complete");
	    }

	    // Update the order status to COMPLETED
	    _order.status = OrderStatus.COMPLETED;
	    _order.completedTimestamp = block.timestamp;

	    // If it's a BUY order, release the escrowed funds to the buyer
	    if (_order.orderType == OrderType.BUY) {
	    	Broker memory broker = brokers[_order.broker];
	    	commitments[broker.escrow] -= _order.amount;
	    }

	    // Emit the OrderComplete event
	    emit OrderComplete(_order.user, _order.broker, _orderId, _order);
	}

}
