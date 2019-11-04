/**
 @author Nikhil Kumar
 @date    23/01/2018
*/
import { getModel as StudentLedgerModel } from './studentLedger.model';
import { getModel as ContentMappingModel } from '../settings/contentMapping/contentMapping.model';
import { getModel as TextbookModel } from '../settings/textbook/textbook.model';
import { getModel as StudentModel } from '../settings/student/student.model';


export async function creditCoin(req, res) {
  try {
    const { assetId } = req.params;
    //check for if AssetId will missing.
    if (!assetId) {
      return res.status(400).send("Asset Id is missing.");
    }

    const [
      StudentLedger,
      ContentMapping,
      Student,
      Textbook] = await Promise.all([
        StudentLedgerModel(req.user_cxt),
        ContentMappingModel(req.user_cxt),
        StudentModel(req.user_cxt),
        TextbookModel(req.user_cxt)
      ]);

    //Check for if AssetId Is present in collection or not!!!
    const assetData = await ContentMapping.findOne({ assetId, active: true });
    if (!assetData) {
      return res.status(404).send("this is invalid asset id...");
    }

    //validate assetId If this id is belong to studentId
    const studentData = await Student.findOne({ active: true, studentId: req.user_cxt.studentId }, { hierarchyLevels: 1, orientation: 1, _id: 0 });
    const orientation = studentData.orientation;
    const className = studentData.hierarchyLevels.L_2;
    const branchName = studentData.hierarchyLevels.L_5;
    const textbookCode = assetData.refs.textbook.code;
    const categoryName = assetData.content.category;
    const textbookData = await Textbook.findOne({ active: true, code: textbookCode, orientations: { $in: [null, '', orientation] }, branches: { $in: [null, '', branchName] } }, { _id: 1 });

    if (!textbookData) {
      return res.status(400).send("This asset is not belong to your course...")
    }


    const studentLedgerResult = await StudentLedger.findOne({ studentId: req.user_cxt.studentId, assetId });
    if (studentLedgerResult) {
      return res.status(405).send("You have already earned coins for this Asset..");
    }

    let Data = new StudentLedger({
      coins: parseFloat(assetData.coins),
      studentId: req.user_cxt.studentId,
      transactionType: "credit",
      assetId,
      "refs.branch.name": branchName,
      "refs.orientation.name": orientation,
      "refs.class.name": className,
      category: categoryName
    });
    await Data.save();

    return res.status(200).send(`${parseFloat(assetData.coins)} credited to your account.`);
  } catch (err) {
    console.log(err)
    return res.status(500).send("Internal server error.");
  };
}


export async function debitCoin(req, res) {
  try {
    const { assetId } = req.params;
    //check for if AssetId will missing.
    if (!assetId) {
      return res.status(400).send("Asset Id is missing.");
    }
    const studentId = req.user_cxt.studentId;
    const [
      StudentLedger,
      ContentMapping,
      Student,
      Textbook] = await Promise.all([
        StudentLedgerModel(req.user_cxt),
        ContentMappingModel(req.user_cxt),
        StudentModel(req.user_cxt),
        TextbookModel(req.user_cxt)
      ]);

    //Check for if AssetId Is present in collection or not!!!
    const assetData = await ContentMapping.findOne({ active: true, assetId });
    if (!assetData) {
      return res.status(404).send("this is invalid asset id...");
    }
    //if no coins for asset id
    // if (!contentMappingData.coins) {
    //   return res.status(400).send("Bad Asset Id, this id have no coins")
    // }
    //validate assetId If this id is belong to studentId
    const studentData = await Student.findOne({ active: true, studentId: req.user_cxt.studentId }, { hierarchyLevels: 1, orientation: 1, _id: 0 });
    const orientation = studentData.orientation;
    const className = studentData.hierarchyLevels.L_2;
    const branchName = studentData.hierarchyLevels.L_5;
    const textbookCode = assetData.refs.textbook.code;
    const categoryName = assetData.content.category;
    const textbookData = await Textbook.findOne({ active: true, code: textbookCode, orientations: { $in: [null, '', orientation] }, branches: { $in: [null, '', branchName] } }, { _id: 1 });
    if (!textbookData) {
      return res.status(400).send("This asset is not belong to your course...")
    }

    const [
      checkUnlockAssetId,
      sumOfCoins] = await Promise.all([
        StudentLedger.findOne({ studentId, assetId }),
        StudentLedger.aggregate([
          { $match: { studentId } },
          { $group: { _id: "$studentId", coins: { $sum: "$coins" } } }
        ])]);
    if (!sumOfCoins.length) {
      return res.status(404).send("You have no created operation till now...");
    }
    if (checkUnlockAssetId) {
      //check for available coin or not 
      return res.status(406).send("You have already unlock  this asset...");
    }

    let sumOfCoin = sumOfCoins[0].coins;
    if ((Math.abs(sumOfCoin) - Math.abs(assetData.coins) < 0)) {
      return res.status(299).send("Sorry! But you have not sufficient ammount of coin to unlock this game...");

    }
    let Data = new StudentLedger({
      coins: parseFloat(assetData.coins),
      studentId: req.user_cxt.studentId,
      transactionType: "debit",
      assetId: assetId,
      "refs.branch.name": branchName,
      "refs.orientation.name": orientation,
      "refs.class.name": className,
      category: categoryName
    });
    await Data.save();
    return res.status(200).send(`${parseFloat(assetData.coins)} debit from your account.`);


  } catch (err) {
    console.log("err : ", err)
    return res.status(500).send("Internal server error.");
  };
}


export async function getQuery(req) {
  const query = {};
  if (req.user_cxt.studentId) query.studentId = req.user_cxt.studentId;
  if (req.body.transactionType == "debit" || req.body.transactionType == "credit") query.transactionType = req.body.transactionType;
  return query;
}
export async function studentCoinLog(req, res) {
  try {
    const studentId = req.user_cxt.studentId;
    //statementType three kind 1. All 2. debit 3. Credit
    const StudentLedger = await StudentLedgerModel(req.user_cxt);
    const query = await getQuery(req);
    const [studentLedgerData, sumOfCoins] = await Promise.all([StudentLedger.find(query, { refs: 0 }).sort({ "created_at": -1 }),
    StudentLedger.aggregate([
      { $match: { studentId } },
      { $group: { _id: "$studentId", coins: { $sum: "$coins" } } }
    ])]);

    if (!sumOfCoins.length) {
      return res.status(404).send("You have no created operation till now...");
    }
    const finalBalance = {
      "finalBalance": sumOfCoins[0].coins
    }
    studentLedgerData.push(finalBalance);
    return res.json(studentLedgerData);

  }
  catch (err) {
    console.log(err)
    return res.status(500).send("Internal server error.");
  }
}
export default { creditCoin, debitCoin, studentCoinLog };
