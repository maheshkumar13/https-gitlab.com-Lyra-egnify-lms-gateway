const _ = require('lodash');
export function validateAccess(validRoles, context){
    if(!validRoles || !validRoles.length) return true;
    if(!context.role) context.role = [];
    return !!_.intersection(validRoles, context.role).length
}