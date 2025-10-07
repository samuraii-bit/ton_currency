import { toNano } from '@ton/core';
import { SendTon } from '../build/SendTon/SendTon_SendTon';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const sendTon = provider.open(await SendTon.fromInit());

    await sendTon.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        null,
    );

    await provider.waitForDeploy(sendTon.address);

    // run methods on `sendTon`
}
