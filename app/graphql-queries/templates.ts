export const hypercert = `
    data {
        units
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
        }
        sales {
          data {
            buyer
          }
        }
        hypercert_id
    }
`;
