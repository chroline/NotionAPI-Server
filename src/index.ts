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
    The format of a page
    """
    type Format{
        cover: String
        font: String
    }

    """
    Metadata of a page or collection.
    """
    type Metadata{
        properties: Unknown
        createdTime: Int
        lastEditedTime: Int
        format: Format
    }

    type Page{
        id: String
        metadata: Metadata
        title: String
        properties: Unknown
        content: [Block!]
    }

    type Collection{
        schema: Unknown
        pages: [Page!]
    }

    input Filter{
        property: String!
        operator: String!
        value: Unknown
    }

    type Query{
        fetchPage(
            pageId: String!
        ): Page
        fetchCollection(
            collectionId: String!
            collectionViewId: String!
            filters: [Filter]
            cursor: String
            limit: String
        ): Collection
    }
`;

const resolvers = {
        Query: {
            fetchPage: async (_, args, context) => {
                const res = await got.post('http://localhost:8081/fetchPage', {
                    json: args,
                    headers: {
                        "Token": context.token
                    }
                })
                return JSON.parse(res.body)
            },
            fetchCollection: async (_, args, context) => {
                const res = await got.post('http://localhost:8081/fetchCollection', {
                    json: args,
                    headers: {
                        "Token": context.token
                    }
                })
                return JSON.parse(res.body)
            }
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