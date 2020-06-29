import {ApolloServer, gql} from "apollo-server"
import got from "got";

const typeDefs = gql`
    """
    Represents unknown or dynamic data
    """
    scalar Unknown

    type TextBlockItem{
        bold: Boolean
        italic: Boolean
        underline: Boolean
        strikethrough: Boolean
        isEquation: Boolean
        link: String
        textColor: String
        bgColor: String
        text: String
    }

    type TextBlockContent{
        level: Int
        items: [TextBlockItem!]
    }

    type SectionBlockContent{
        blocks: [String!]
    }

    type TodoBlockContent{
        checked: Boolean!
        items: [TextBlockItem!]
    }

    """
    Bulleted list, numbered list, quote
    """
    type TextItemsBlockContent{
        items: [TextBlockItem!]
    }

    type CalloutBlockContent{
        format: Unknown
        items: [TextBlockItem!]
    }

    union BlockContent = TextBlockContent | SectionBlockContent | TodoBlockContent | TextItemsBlockContent | CalloutBlockContent

    """
    A block of a page.
    """
    type Block{
        id: String!
        """
        The type of block.
        """
        type: String!
        """
        The content of the block. Type "Unknown" because schema is dynamic.
        """
        content: BlockContent
    }

    """
    A property of a page in a database.
    """
    type Property{
        """
        The name of the property.
        """
        name: String!
        """
        The type of property.
        """
        type: String!
        """
        The options of the property. Type "Unknown" because schema is dynamic.
        """
        options: [Unknown]
    }

    """
    Metadata of a page or collection.
    """
    type Metadata{
        properties: Unknown
        createdTime: Int
        lastEditedTime: Int
        format: Unknown
    }

    type Page{
        metadata: Metadata
        title: String
        properties: Unknown
        content: [Block!]
    }

    type Collection{
        schema: [Property!]
        pages: [Page!]
    }

    input Filter{
        property: String!
        operator: String!
        value: String
    }

    type Query{
        fetchPage(
            pageId: String!
        ): Page
        fetchCollection(
            collectionId: String!
            collectionView: String!
            filter: Filter
        ): Collection
    }
`;

const resolvers = {
		Query: {
			fetchPage: async (_, args, context) => {
				const res = await got.post('http://localhost:8081/fetchPage', {
					json: {
						pageId: args.pageId
					},
					headers: {
						"Token": context.token
					}
				})
				return JSON.parse(res.body)
			},
		},
		BlockContent: {
			"__resolveType": (item) => item.type
		}
	}
;

const server = new ApolloServer({
	typeDefs,
	resolvers,
	context: ({req}) => ({
		token: req.headers.token
	})
});

// The `listen` method launches a web server.
server.listen().then(({url}) => {
	console.log(`🚀  Server ready at ${url}`);
});