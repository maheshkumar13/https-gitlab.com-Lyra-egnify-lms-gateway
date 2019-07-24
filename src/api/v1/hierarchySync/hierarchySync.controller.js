import { getModel as InstituteHierarchyModel } from '../../settings/instituteHierarchy/instituteHierarchy.model';

export function createHierarchy(req, res) {
  const args = req.body;
  let bodyValidationFields = '';
  const mandateFields = ['country', 'class', 'state', 'city', 'branch', 'section', 'createFrom'];
  let trimString = false;
  if (args.createFrom) args.createFrom = args.createFrom.trim();
  let hierarchyPath = '';
  const checkExistingPaths = {};
  let latestPath = '';
  const order = [];
  if (args.createFrom === 'country') {
    res.statusMessage = 'Sorry!, you can not create from country';
    return res.status(403).end();
  }
  mandateFields.forEach((x) => {
    if (x === 'createFrom') return;
    if (args.createFrom === x) trimString = true;
    if (!args[x]) bodyValidationFields += `${x},`;
    else {
      args[x] = args[x].replace('-', ' ');
      if (trimString) {
        order.push(x);
        args[x] = args[x].trim();
        if (latestPath) latestPath += `-${args[x]}`;
        else latestPath = args[x];
        checkExistingPaths[x] = latestPath;
      } else {
        if (hierarchyPath) hierarchyPath += `-${args[x]}`;
        else hierarchyPath = args[x];
        latestPath = hierarchyPath;
      }
    }
  });
  if (bodyValidationFields) {
    res.statusMessage = `${bodyValidationFields} field(s) not found in body or can not be empty`;
    return res.status(404).end();
  }
  if (!mandateFields.slice(0, mandateFields.length - 1).includes(args.createFrom)) {
    res.statusMessage = 'Invalid createFrom value';
    return res.status(404).end();
  }
  return InstituteHierarchyModel(req.user_cxt).then((InstituteHierarchy) => {
    const query = {
      pathId: { $regex: `^${hierarchyPath}$`, $options: 'i' },
      active: true,
    };
    const checkExistingPathsQuery = {
      pathId: { $regex: `^${checkExistingPaths[args.createFrom]}$`, $options: 'i' },
      active: true,
    };
    return Promise.all([
      InstituteHierarchy.findOneAndUpdate(query, { $inc: { numberOfChildren: 1 } }),
      InstituteHierarchy.findOne(checkExistingPathsQuery),
    ]).then(([hierarchyObj, toCreateObj]) => {
      if (!hierarchyObj) {
        res.statusMessage = `Invalid hierarchy to create ${args.createFrom}`;
        return res.status(404).end();
      }

      if (toCreateObj) {
        res.statusMessage = `${args.createFrom} already exists in given hierarchy`;
        return res.status(403).end();
      }

      hierarchyPath = hierarchyObj.pathId;
      hierarchyObj.numberOfChildren += 1; //eslint-disable-line
      let currentParentObj = hierarchyObj;
      const data = [];
      order.map((x) => { //eslint-disable-line
        const tempObj = {
          childCode: `${currentParentObj.childCode}-l${currentParentObj.level + 1}${currentParentObj.numberOfChildren}`,
          pathId: `${currentParentObj.pathId}-${args[x]}`,
          child: args[x],
          parentCode: currentParentObj.childCode,
          parent: currentParentObj.child,
          level: currentParentObj.level + 1,
          levelName: x.charAt(0).toUpperCase() + x.substring(1),
          numberOfChildren: x === 'section' ? 0 : 1,
          isLeafNode: x === 'section',
          active: true,
          anscetors: currentParentObj.anscetors,
          metadata: {
            source: 'chaitanya_api',
          },
        };
        tempObj.anscetors.push({
          child: currentParentObj.child,
          childCode: currentParentObj.childCode,
          parent: currentParentObj.parent,
          parentCode: currentParentObj.parentCode,
          level: currentParentObj.level,
          levelName: currentParentObj.levelName,
        });
        currentParentObj = JSON.parse(JSON.stringify(tempObj));
        data.push(tempObj);
      });
      return InstituteHierarchy.create(data).then(() => { // eslint-disable-line
        return res.send(data);
      });
    });
  });
}
export default {
  createHierarchy,
};
