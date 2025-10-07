import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { Item } from '../build/Item/Item_Item';
import { ItemFactory } from '../build/Item/Item_ItemFactory';
import '@ton/test-utils';

describe('Item', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let itemFactory: SandboxContract<ItemFactory>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        itemFactory = blockchain.openContract(await ItemFactory.fromInit());

        deployer = await blockchain.treasury('deployer');

        const deployResult = await itemFactory.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            null,
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: itemFactory.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and item are ready to use
    });

    it("should deploy 3 contracts correctly", async() => {
        let items = []
        for (let i = 1; i < 4; ++i) {
            const deployResult = await itemFactory.send(
                deployer.getSender(),
                {
                    value: toNano("0.02")
                },
                {
                    $$type: "DeployContract",
                    id: BigInt(i)
                }
            )

            const currentItemAddressFromFactory = await itemFactory.getItemAddress(BigInt(i));
            
            expect(deployResult.transactions).toHaveTransaction({
                from: itemFactory.address,
                to: currentItemAddressFromFactory,
                deploy: true,
                success: true,
            });

            
        }

        for (let i = 0; i < items.length; ++i) {
            const currentItemAddressFromFactory = await itemFactory.getItemAddress(BigInt(i));
            const currentItem = Item.fromAddress(currentItemAddressFromFactory);
            const currentItemId = await currentItem.getId(blockchain.provider(currentItemAddressFromFactory));
            const currentItemAddress = await currentItem.getMyAddress(blockchain.provider(currentItemAddressFromFactory));

            expect(currentItemId).toEqual(BigInt(i + 1));
            expect(currentItemAddress).toEqual(currentItemAddressFromFactory);
        } 
    });
});