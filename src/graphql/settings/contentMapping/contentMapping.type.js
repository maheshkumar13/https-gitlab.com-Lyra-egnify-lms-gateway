import {
    GraphQLObjectType as ObjectType,
	GraphQLString as StringType,
	GraphQLInt as IntType,
  } from 'graphql';
    

  const contentType = new ObjectType({
		name: 'ContentMappingContentType',
		fields: {
			name: { type: StringType, description: 'Conent name' },
			category: { type: StringType, description: 'Content category' },
			type: { type: StringType, description: 'Conent type' },
		}
  })
  
  const resourceType = new ObjectType({
		name: 'ContentMappingResourceType',
		fields: {
			key: { type: StringType, description: 'Key/path of the resource' },
			size: { type: StringType, description: 'resource size' },
			type: { type: StringType, description: 'resource type' },
		}
  })
  
  const publicationType = new ObjectType({
		name: 'ContentMappingPublicationType',
		fields: {
			publisher: { type: StringType, description: 'Name of publisher' },
			year: { type: StringType, description: 'Year of publication' },
		}
  })
  
  const refCodesType = new ObjectType({
		name: 'ContentMappingRefCodesType',
		fields: {
			code: { type: StringType, description: 'Internal code of reference' },
		}
  })
  
  const refsType = new ObjectType({
		name: 'ContentMappingRefsType',
		fields: {
			textbook: { type: refCodesType, description: 'Textbook reference' },
   		topic: { type: refCodesType, description: 'Topic reference' },
		}
  })
  
  const ContentMappingType = new ObjectType({
    name: 'ContentMappingType',
    fields: {
			content: { type: contentType, description: 'Content details' },
			resource:{ type: resourceType, description: 'Resource details' },
			refs: { type: refsType, description: 'References to the object' },
			orientation: { type: StringType, description: 'Orientation' },
			publication: { type: publicationType, description: 'Publication details' },
			category: { type: StringType, description: 'Category' },
			coins: { type: IntType, description: 'Coins' }
    },
  });
  
  
  export default ContentMappingType;
  