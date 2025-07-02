import { ResultOf, graphql } from "@/lib/graphql";

export const HyperboardFragment = graphql(`
  fragment HyperboardFragment on Hyperboard {
    id
    admins {
      data {
        address
        chain_id
      }
    }
    name
    background_image
    grayscale_images
    tile_border_color
    sections {
      count
      data {
        label
        collections {
          name
          admins {
            address
            display_name
          }
          description
          id
        }
        entries {
          is_blueprint
          id
          percentage_of_section
          display_size
          name
          total_units
          owners {
            data {
              address
              units
              avatar
              display_name
            }
          }
        }
        owners {
          data {
            percentage_owned
            address
            display_name
            avatar
          }
        }
      }
    }
  }
`);

export type HyperboardFragment = ResultOf<typeof HyperboardFragment>;
