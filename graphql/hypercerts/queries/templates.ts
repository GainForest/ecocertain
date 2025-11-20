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
        uri
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
            currency
            currency_amount
            creation_block_timestamp
          }
        }
        hypercert_id
    }
`;
