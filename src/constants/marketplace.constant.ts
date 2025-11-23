import { MarketplaceStatus } from "prisma/generated/enums";
import { ListingStatus } from "prisma/generated/enums";

export const MARKETPLACE_STATUS_FROM_NUMBER = {
    0: MarketplaceStatus.ACTIVE,
    1: MarketplaceStatus.INACTIVE,
    2: MarketplaceStatus.SUSPENDED,
}

export const LISTING_STATUS_FROM_NUMBER = {
    0: ListingStatus.ACTIVE,
    1: ListingStatus.SOLD,
    2: ListingStatus.CANCELLED,
    3: ListingStatus.EXPIRED,
}

export const MARKETPLACE_STATUS_TO_NUMBER = {
    [MarketplaceStatus.ACTIVE]: 0,
    [MarketplaceStatus.INACTIVE]: 1,
    [MarketplaceStatus.SUSPENDED]: 2,
}

export const LISTING_STATUS_TO_NUMBER = {
    [ListingStatus.ACTIVE]: 0,
    [ListingStatus.SOLD]: 1,
    [ListingStatus.CANCELLED]: 2,
    [ListingStatus.EXPIRED]: 3,
}
