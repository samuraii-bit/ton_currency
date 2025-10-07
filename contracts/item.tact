import "@stdlib/deploy";

// Since v1.6.0, Tact has a contract parameters syntax that can supersede
// lazy initialization by init() for all contracts that do not require specific on-chain
// deployment logic that must be run only once in the `init()` function.
//
// Note that the empty parameter list above is still a parameter list,
// meaning that the contract won't have an implicit or explicit `init(){:tact}` function
// and will enjoy storage write optimizations and use less gas overall.
//
// See: https://docs.tact-lang.org/book/contracts/#parameters

message DeployContract{
    id: Int as uint256;
}

contract Item(id: Int as uint256) {
    receive() {

    }
    
    receive(msg: Deploy) {
        
    }

    get fun id(): Int { 
        return self.id;
    }

    get fun myAddress(): Address {
        return myAddress();
    }
}

contract ItemFactory() {
    // Empty receiver for the deployment,
    // which expects the `null` message body
    receive() {
        // Forward the remaining value in the
        // incoming message back to the sender
        // cashback(sender());
    }

    receive(msg: DeployContract) {
        let init: StateInit = initOf Item(msg.id);
        let newItemAddress: Address = contractAddress(init);
        send(SendParameters{
            to: newItemAddress,
            value: 0,
            mode: SendRemainingValue + SendIgnoreErrors, 
            bounce: true, 
            code: init.code,
            data: init.data,
            body: Deploy {queryId: 0}.toCell()
        })
    }

    get fun itemAddress(id: Int): Address {
        let init: StateInit = initOf Item(id);
        return contractAddress(init);
    }
}

