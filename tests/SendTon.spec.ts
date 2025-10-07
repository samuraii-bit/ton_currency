import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { SendTon } from '../build/SendTon/SendTon_SendTon';
import '@ton/test-utils';

describe('SendTon', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let sendTon: SandboxContract<SendTon>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        sendTon = blockchain.openContract(await SendTon.fromInit());

        deployer = await blockchain.treasury('deployer');

        const deployResult = await sendTon.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            null,
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: sendTon.address,
            deploy: true,
            success: true,
        });

        await sendTon.send(
            deployer.getSender(), 
            {
                value: toNano("500")
            },
            null
        )
    });

    it('should deploy and receive funds', async () => {
        const balanceBefore = await sendTon.getBalance();
        expect(balanceBefore).toBeGreaterThan(500n);
        // the check is done inside beforeEach
        // blockchain and sendTon are ready to use
    });

    it("Should revert if non-owner calls withdraw all", async() => {
        const user = await blockchain.treasury("user");
        const result = await sendTon.send(
            user.getSender(),
            {
                value: toNano("0.02")
            },
            "withdraw all"
        )

        expect(result.transactions).toHaveTransaction({
            from: user.address,
            to: sendTon.address,
            success: false,
            exitCode: 45494
        }); 
    });

    it("should withdraw all successfully", async() => {
        const balanceBefore = await sendTon.getBalance();
        // expect(Number(balanceBefore)).toBeCloseTo(500)

        await sendTon.send(
            deployer.getSender(),
            {
                value: toNano("0.02")
            },
            "withdraw all"
        )

        const balanceAfter = await sendTon.getBalance();
        expect(toNano(balanceBefore)).toBeGreaterThan(toNano(balanceAfter));
        expect(await sendTon.getBalance()).toEqual(0n);
    });

    it("should withdraw all safe and successfully", async() => {
        const balanceBefore = await sendTon.getBalance();
        // expect(Number(balanceBefore)).toBeCloseTo(500)

        await sendTon.send(
            deployer.getSender(),
            {
                value: toNano("0.02")
            },
            "withdraw all safe"
        )

        const balanceAfter = await sendTon.getBalance();
        expect(toNano(balanceBefore)).toBeGreaterThan(toNano(balanceAfter));
        expect(await sendTon.getBalance()).toBeGreaterThan(0n);
    });

    it("should withdraw with message", async() => {
        const balanceBefore = await sendTon.getBalance();
        // expect(Number(balanceBefore)).toBeCloseTo(500)
        await sendTon.send(
            deployer.getSender(),
            {
                value: toNano("0.02")
            },
            {
                $$type: "Withdraw",
                amount: toNano("150")
            }
        )

        const balanceAfter = await sendTon.getBalance();
        expect(toNano(balanceBefore)).toBeGreaterThan(toNano(balanceAfter));
        expect(await sendTon.getBalance()).toBeGreaterThan(0n);
    });
});
