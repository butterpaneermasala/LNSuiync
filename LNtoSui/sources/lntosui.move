/*
/// Module: lntosui
module lntosui::lntosui;
*/

// For Move coding conventions, see
// https://docs.sui.io/concepts/sui-move-concepts/conventions

// SPDX-License-Identifier: Apache-2.0

module lntosui::lightning_btc {
    use sui::coin::{Self, Coin ,TreasuryCap};
    use sui::tx_context::{Self, TxContext};
    use sui::url;
    use std::option;

    public struct LIGHTNING_BTC has drop {}

    // Internal initializer, called on publish
    fun init(witness: LIGHTNING_BTC, ctx: &mut TxContext) {
        let (treasury_cap, metadata) = coin::create_currency(
            witness,
            8, // decimals
            b"LNS",
            b"Lightning Sui",
            b"Lightning BTC token on Sui",
            option::some(url::new_unsafe_from_bytes(b"https://raw.githubusercontent.com/butterpaneermasala/assets/refs/heads/main/LNsuiync.png")),
            ctx
        );
        transfer::public_freeze_object(metadata);
        transfer::public_transfer(treasury_cap, tx_context::sender(ctx));
    }


    // Only the holder of TreasuryCap can mint
    public entry fun mint(
        treasury_cap: &mut TreasuryCap<LIGHTNING_BTC>,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext,
    ) {
        let coin = coin::mint(treasury_cap, amount, ctx);
        transfer::public_transfer(coin, recipient)
    }
    // Inside your Move module (e.g., lntosui::lightning_btc)

    public entry fun burn(
        treasury_cap: &mut TreasuryCap<LIGHTNING_BTC>,
        coin: Coin<LIGHTNING_BTC>,
    ) {
        coin::burn(treasury_cap, coin);
    }



}





