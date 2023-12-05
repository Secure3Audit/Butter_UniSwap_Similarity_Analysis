// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;

import '@butter/v3-core/contracts/interfaces/IButterFactory.sol';
import '@butter/v3-core/contracts/interfaces/IButterPool.sol';

import './PeripheryImmutableState.sol';
import '../interfaces/IPoolInitializer.sol';

/// @title Creates and initializes Pools
abstract contract PoolInitializer is IPoolInitializer, PeripheryImmutableState {
    /// @inheritdoc IPoolInitializer
    function createAndInitializePoolIfNecessary(
        address token0,
        address token1,
        uint24 fee,
        uint160 sqrtPriceX96
    ) external payable override returns (address pool) {
        require(token0 < token1);
        pool = IButterFactory(factory).getPool(token0, token1, fee);

        if (pool == address(0)) {
            pool = IButterFactory(factory).createPool(token0, token1, fee);
            IButterPool(pool).initialize(sqrtPriceX96);
        } else {
            (uint160 sqrtPriceX96Existing, , , , , , ) = IButterPool(pool).slot0();
            if (sqrtPriceX96Existing == 0) {
                IButterPool(pool).initialize(sqrtPriceX96);
            }
        }
    }
}
