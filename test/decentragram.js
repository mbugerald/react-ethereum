// eslint-disable-next-line no-undef
const Decentragram = artifacts.require('Decentragram')

require('chai')
    .use(require('chai-as-promised'))
    .should()

// eslint-disable-next-line no-undef
contract('Decentragram', ([deployer, author, tipper]) => {
    let decentragram, imageCount = 0;

    // eslint-disable-next-line no-undef
    before(async () => {
        decentragram = await Decentragram.deployed();
    })

    describe('deployment', async () => {
        it('deployed successfully', async () => {
            const address = await decentragram.address;
            // eslint-disable-next-line no-undef
            assert.notEqual(address, 0x0)
            // eslint-disable-next-line no-undef
            assert.notEqual(address, '')
            // eslint-disable-next-line no-undef
            assert.notEqual(address, null)
            // eslint-disable-next-line no-undef
            assert.notEqual(address, undefined)
        })
    })

    describe('images', async () => {
        let result
        const hash = "abc123"

        // eslint-disable-next-line no-undef
        before(async () => {
            result = await decentragram.uploadImage(hash, 'Image description', {from: author});
            imageCount = await decentragram.imageCount();
        })

        it('creates images', async () => {
            // eslint-disable-next-line no-undef
            assert.equal(imageCount, 1)
            const event = result.logs[0].args
            // eslint-disable-next-line no-undef
            assert.equal(event.id.toNumber(), imageCount.toNumber(), 'id is correct')
            // eslint-disable-next-line no-undef
            assert.equal(event.hash, hash, 'Hash is correct')
            // eslint-disable-next-line no-undef
            assert.equal(event.description, 'Image description', 'description is correct')
            // eslint-disable-next-line no-undef
            assert.equal(event.tipAmount, '0', 'tip amount is correct')
            // eslint-disable-next-line no-undef
            assert.equal(event.author, author, 'author is correct')

            await decentragram.uploadImage('', 'Image description', {from: author}).should.be.rejected;
            await decentragram.uploadImage('Image hash', '', {from: author}).should.be.rejected;
        })

        it('list images', async () => {
            const image = await decentragram.images(imageCount);
            // eslint-disable-next-line no-undef
            assert.equal(image.id.toNumber(), imageCount.toNumber(), 'id is correct')
            // eslint-disable-next-line no-undef
            assert.equal(image.hash, hash, 'Hash is correct')
            // eslint-disable-next-line no-undef
            assert.equal(image.description, 'Image description', 'description is correct')
            // eslint-disable-next-line no-undef
            assert.equal(image.tipAmount, '0', 'tip amount is correct')
            // eslint-disable-next-line no-undef
            assert.equal(image.author, author, 'author is correct')
        })

        it('allows users to tip images', async () => {
            let oldAuthorBalance;
            // eslint-disable-next-line no-undef
            oldAuthorBalance = await web3.eth.getBalance(author)
            // eslint-disable-next-line no-undef
            oldAuthorBalance = new web3.utils.BN(oldAuthorBalance);

            result = await decentragram.tipImageOwner(
                imageCount,
                // eslint-disable-next-line no-undef
                {from: tipper, value: web3.utils.toWei('1', 'Ether')}
            )

            // SUCCESS
            const event = result.logs[0].args;
            // eslint-disable-next-line no-undef
            assert.equal(event.id.toNumber(), imageCount.toNumber(), 'id is correct');
            // eslint-disable-next-line no-undef
            assert.equal(event.hash, hash, 'harsh is correct');
            // eslint-disable-next-line no-undef
            assert.equal(event.description, 'Image description', 'description is correct');
            // eslint-disable-next-line no-undef
            assert.equal(event.tipAmount, '1000000000000000000', 'tip amount is correct');
            // eslint-disable-next-line no-undef
            assert.equal(event.author, author, 'author is correct');

            let newAuthorBalance
            // eslint-disable-next-line no-undef
            newAuthorBalance = await web3.eth.getBalance(author);

            // eslint-disable-next-line no-undef
            newAuthorBalance = new web3.utils.BN(newAuthorBalance);

            let tipImageOwner;

            // eslint-disable-next-line no-undef
            tipImageOwner = web3.utils.toWei('1', 'Ether');

            // eslint-disable-next-line no-undef
            tipImageOwner = new web3.utils.BN(tipImageOwner);

            const expectedBalance = oldAuthorBalance.add(tipImageOwner)
            // eslint-disable-next-line no-undef
            assert.equal(newAuthorBalance.toString(), expectedBalance.toString())

            // eslint-disable-next-line no-undef
            await decentragram.tipImageOwner(99, {from: tipper, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;
        })
    })
})
