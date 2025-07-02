export const hypercert = `
    data {
        creation_block_timestamp
        units
        creator_address
        contract {
          chain_id
        }
        metadata {
          name
          description
        }
        orders {
          totalUnitsForSale
          cheapestOrder {
            pricePerPercentInUSD
          }
          data {
            orderNonce
            id
          }
        }
        sales {
          data {
            buyer
          }
        }
        hypercert_id
    }
`;
