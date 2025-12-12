const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API',
      version: '1.0.0',
      description: 'Onlytems API 문서',
      contact: {
        name: 'API Support',
        email: 'sanghyunpark@kakao.com'
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
            mana: {
              type: 'integer',
              example: 1000
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
              enum: ['FREE', 'FIXED', 'OFFER'],
              example: 'OFFER',
              description: 'FREE: 자유 제안, FIXED: 고정 가격, OFFER: 제안 받기'
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
              enum: ['ON_SALE', 'IN_TRANSACTION', 'SOLD_OUT', 'EXPIRED', 'CANCELLED'],
              example: 'ON_SALE',
              description: 'ON_SALE: 판매중, IN_TRANSACTION: 거래중, SOLD_OUT: 판매완료, EXPIRED: 만료, CANCELLED: 취소'
            },
            highest_bid_price: {
              type: 'number',
              example: 4800000
            },
            bidder_count: {
              type: 'integer',
              example: 3
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
        Bid: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            order_id: {
              type: 'integer',
              example: 1
            },
            seller_id: {
              type: 'integer',
              example: 1
            },
            seller_nickname: {
              type: 'string',
              example: 'seller123'
            },
            buyer_id: {
              type: 'integer',
              example: 2
            },
            buyer_nickname: {
              type: 'string',
              example: 'buyer123'
            },
            price: {
              type: 'number',
              example: 4500000
            },
            state: {
              type: 'string',
              enum: ['WAIT', 'ACCEPT', 'REJECT', 'CANCEL', 'COMPLETED'],
              example: 'WAIT'
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
            rarity: {
              type: 'string',
              example: 'LEGENDARY'
            },
            order_price: {
              type: 'number',
              example: 5000000
            },
            seller_name: {
              type: 'string',
              example: 'John Doe'
            },
            buyer_name: {
              type: 'string',
              example: 'Jane Smith'
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