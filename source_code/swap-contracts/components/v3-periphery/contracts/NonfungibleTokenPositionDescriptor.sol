// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;
pragma abicoder v2;

import '@butter/v3-core/contracts/interfaces/IButterPool.sol';

// import '@openzeppelin/contracts-upgradeable/proxy/Initializable.sol';

import './libraries/ChainId.sol';
import './libraries/SafeERC20Namer.sol';
import './interfaces/INonfungiblePositionManager.sol';
import './interfaces/INonfungibleTokenPositionDescriptor.sol';
import './interfaces/IERC20Metadata.sol';
import './libraries/PoolAddress.sol';
import './libraries/NFTDescriptor.sol';
import './libraries/TokenRatioSortOrder.sol';

/// @title Describes NFT token positions
/// @notice Produces a string containing the data URI for a JSON metadata string
contract NonfungibleTokenPositionDescriptor is INonfungibleTokenPositionDescriptor {
    address private constant DAI = 0x48E2c4D04D618aE66e602d0985843071E8a278F9;
    address private constant USDC = 0x27e8c30bEE531b5882530e3cA0fE6d5152D5511a;
    address private constant USDT = 0x2B2cc59fF1e4300FEfCB3f5aE9293D3347705d91;
    address private constant TBTC = 0xEe732EbaB18Fc182fbD7d17ba8947F1D155466De;
    address private constant WBTC = 0x5F695625E24762c26124f016ca1d8650fa1f5760;

    address public immutable WETH9;
    /// @dev A null-terminated string
    bytes32 public immutable nativeCurrencyLabelBytes;

    // function initialize(address _WETH9, bytes32 _nativeCurrencyLabelBytes) initializer public {
    //     WETH9 = _WETH9;
    //     nativeCurrencyLabelBytes = _nativeCurrencyLabelBytes;
    // }

    constructor(address _WETH9, bytes32 _nativeCurrencyLabelBytes) {
        WETH9 = _WETH9;
        nativeCurrencyLabelBytes = _nativeCurrencyLabelBytes;
    }

    /// @notice Returns the native currency label as a string
    function nativeCurrencyLabel() public view returns (string memory) {
        uint256 len = 0;
        while (len < 32 && nativeCurrencyLabelBytes[len] != 0) {
            len++;
        }
        bytes memory b = new bytes(len);
        for (uint256 i = 0; i < len; i++) {
            b[i] = nativeCurrencyLabelBytes[i];
        }
        return string(b);
    }

    /// @inheritdoc INonfungibleTokenPositionDescriptor
    function tokenURI(INonfungiblePositionManager positionManager, uint256 tokenId)
        external
        view
        override
        returns (string memory)
    {
        (, , address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, , , , , ) =
            positionManager.positions(tokenId);

        IButterPool pool =
        IButterPool(
                PoolAddress.computeAddress(
                    positionManager.factory(),
                    PoolAddress.PoolKey({token0: token0, token1: token1, fee: fee})
                )
            );

        bool _flipRatio = flipRatio(token0, token1, ChainId.get());
        address quoteTokenAddress = !_flipRatio ? token1 : token0;
        address baseTokenAddress = !_flipRatio ? token0 : token1;
        (, int24 tick, , , , , ) = pool.slot0();

        return
            NFTDescriptor.constructTokenURI(
                NFTDescriptor.ConstructTokenURIParams({
                    tokenId: tokenId,
                    quoteTokenAddress: quoteTokenAddress,
                    baseTokenAddress: baseTokenAddress,
                    quoteTokenSymbol: quoteTokenAddress == WETH9
                        ? nativeCurrencyLabel()
                        : SafeERC20Namer.tokenSymbol(quoteTokenAddress),
                    baseTokenSymbol: baseTokenAddress == WETH9
                        ? nativeCurrencyLabel()
                        : SafeERC20Namer.tokenSymbol(baseTokenAddress),
                    quoteTokenDecimals: IERC20Metadata(quoteTokenAddress).decimals(),
                    baseTokenDecimals: IERC20Metadata(baseTokenAddress).decimals(),
                    flipRatio: _flipRatio,
                    tickLower: tickLower,
                    tickUpper: tickUpper,
                    tickCurrent: tick,
                    tickSpacing: pool.tickSpacing(),
                    fee: fee,
                    poolAddress: address(pool)
                })
            );
    }

    function flipRatio(
        address token0,
        address token1,
        uint256 chainId
    ) public view returns (bool) {
        return tokenRatioPriority(token0, chainId) > tokenRatioPriority(token1, chainId);
    }

    function tokenRatioPriority(address token, uint256 chainId) public view returns (int256) {
        if (token == WETH9) {
            return TokenRatioSortOrder.DENOMINATOR;
        }
        if (chainId == 1) {
            if (token == USDC) {
                return TokenRatioSortOrder.NUMERATOR_MOST;
            } else if (token == USDT) {
                return TokenRatioSortOrder.NUMERATOR_MORE;
            } else if (token == DAI) {
                return TokenRatioSortOrder.NUMERATOR;
            } else if (token == TBTC) {
                return TokenRatioSortOrder.DENOMINATOR_MORE;
            } else if (token == WBTC) {
                return TokenRatioSortOrder.DENOMINATOR_MOST;
            } else {
                return 0;
            }
        }
        return 0;
    }
}
