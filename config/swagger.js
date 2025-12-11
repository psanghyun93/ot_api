const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AI Test API',
      version: '1.0.0',
      description: 'API documentation for Onlytems',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'http://localhost:3000',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'object'
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            name: {
              type: 'string',
              example: 'John Doe'
            },
            email: {
              type: 'string',
              example: 'john@example.com'
            },
            blizzard_battletag: {
              type: 'string',
              example: 'Player#1234'
            },
            avatar_url: {
              type: 'string',
              example: 'https://example.com/avatar.jpg'
            },
            last_login: {
              type: 'string',
              format: 'date-time'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Season: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            name: {
              type: 'object',
              properties: {
                ko: {
                  type: 'string',
                  example: '시즌 1'
                },
                zh: {
                  type: 'string',
                  example: '赛季 1'
                },
                ja: {
                  type: 'string',
                  example: 'シーズン 1'
                },
                en: {
                  type: 'string',
                  example: 'Season 1'
                }
              }
            },
            start_time: {
              type: 'string',
              format: 'date-time'
            },
            end_time: {
              type: 'string',
              format: 'date-time'
            },
            state: {
              type: 'string',
              enum: ['ETERNAL', 'WAITING', 'ONGOING', 'ENDED'],
              example: 'ONGOING'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        SellOrder: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            season: {
              type: 'string',
              example: 'Season 3'
            },
            item_type: {
              type: 'string',
              example: 'EQUIPMENT'
            },
            category: {
              type: 'string',
              example: 'WEAPON'
            },
            sub_category: {
              type: 'string',
              example: 'SWORD'
            },
            rarity: {
              type: 'string',
              example: 'LEGENDARY'
            },
            grade: {
              type: 'string',
              example: 'SACRED'
            },
            greater_affixes: {
              type: 'integer',
              example: 2
            },
            affixes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    example: 'Critical Strike Damage'
                  },
                  value: {
                    type: 'number',
                    example: 45.5
                  }
                }
              }
            },
            aspect_id: {
              type: 'string',
              example: 'RAIMENT_OF_THE_INFINITE'
            },
            aspect: {
              type: 'array',
              items: {
                type: 'number'
              },
              example: [15, 20, 10]
            },
            seller_message: {
              type: 'string',
              example: 'Perfect rolls! Must see!'
            },
            price: {
              type: 'number',
              example: 5000000
            },
            bid_policy: {
              type: 'string',
              enum: ['FIXED', 'NEGOTIABLE', 'AUCTION'],
              example: 'NEGOTIABLE'
            },
            seller_id: {
              type: 'integer',
              example: 1
            },
            seller_name: {
              type: 'string',
              example: 'John Doe'
            },
            seller_nickname: {
              type: 'string',
              example: 'player123'
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'SOLD', 'CANCELLED', 'EXPIRED'],
              example: 'ACTIVE'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;