// Since v1.6.0, Tact has a contract parameters syntax that can supersede
// lazy initialization by init() for all contracts that do not require specific on-chain
// deployment logic that must be run only once in the `init()` function.
//
// Note that the empty parameter list above is still a parameter list,
// meaning that the contract won't have an implicit or explicit `init(){:tact}` function
// and will enjoy storage write optimizations and use less gas overall.
//
// See: https://docs.tact-lang.org/book/contracts/#parameters

message Withdraw {
    amount: Int as coins;     
}

contract SendTon {
    // Empty receiver for the deployment,
    // which expects the `null` message body
    owner: Address;
    const minTonForStorage: Int = ton("0.01"); // 1KB for 2.5 years 
    init() {
        self.owner = sender();
    }
    receive() {
        // Forward the remaining value in the
        // incoming message back to the sender
        // cashback(sender());
    }


    fun onlyOwner() {
        require(sender() == self.owner, "Only owner can withdraw the funds");
    }

    receive ("withdraw all") {
        self.onlyOwner();

        send(SendParameters{
            to: sender(),
            value: 0,
            bounce: true,
            mode: SendRemainingBalance + SendIgnoreErrors
        });
    }

    receive ("withdraw all safe") {
        self.onlyOwner();

        send(SendParameters{
            to: sender(),
            value: myBalance() - context().value - self.minTonForStorage,
            bounce: true,
            mode: SendIgnoreErrors + SendRemainingValue
        });
    }

    receive(msg: Withdraw) {
        self.onlyOwner();
        let amount: Int = min(msg.amount, myBalance() - context().value - self.minTonForStorage); 
        require(amount > 0, "Insufficient balance");

        send(SendParameters{
            to: sender(),
            value: amount,
            bounce: true,
            mode: SendIgnoreErrors + SendRemainingValue
        });
    }

    get fun balance(): Int {
        return myBalance();
    }
}
