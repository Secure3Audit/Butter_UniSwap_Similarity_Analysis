// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;
pragma abicoder v2;

import '@butter/v3-periphery/contracts/base/SelfPermit.sol';
import '@butter/v3-periphery/contracts/base/PeripheryImmutableState.sol';

import './interfaces/ISwapRouter02.sol';
import './LegacySwapRouter.sol';
import './V3SwapRouter.sol';
import './base/ApproveAndCall.sol';
import './base/MulticallExtended.sol';

/// @title Butter & Legacy Swap Router
contract SwapRouter02 is ISwapRouter02, LegacySwapRouter, V3SwapRouter, ApproveAndCall, MulticallExtended, SelfPermit {
    constructor(
        address _legacyFactory,
        address factoryV3,
        address _positionManager,
        address _WETH9
    ) ImmutableState(_legacyFactory, _positionManager) PeripheryImmutableState(factoryV3, _WETH9) {}
}
