
import { getModel as StudentLedgerModel } from './studentLedger.model';
import { getModel as ContentMappingModel } from '../settings/contentMapping/contentMapping.model';
import { getModel as TextbookModel } from '../settings/textbook/textbook.model';
import { getModel as StudentModel } from '../settings/student/student.model';


export async function creditCoin(req, res) {
  try {
    const { assetId } = req.params;
    //check for if AssetId will missing.
    if (!assetId) {
      return res.status(400).json({
        status: "failure",
        message: "assetId is missing !!!",
        data: ""
      });
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
      return res.status(404).json({
        status: "failure",
        message: "this is invalid asset id !!!",
        data: ""
      });
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
      return res.status(400).json({
        status: "failure",
        message: "This asset is not belong to your course!!!",
        data: ""
      });
    }


    const studentLedgerResult = await StudentLedger.findOne({ studentId: req.user_cxt.studentId, assetId });
    if (studentLedgerResult) {
      //208[Already reported]
      return res.status(208).json({
        status: "warning",
        message: "You have already earned coins for this Asset !!!",
        data: ""
      });
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

    return res.status(200).json({
      status: "success",
      message: `${parseFloat(assetData.coins)} coins has been credited to your account.`,
      data: `${ parseFloat(assetData.coins)}`,
    });
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      status: "failure",
      message: "Internal Server Error !!!",
      data: ""
    });
  };
}


export async function debitCoin(req, res) {
  try {
    const { assetId } = req.params;
    //check for if AssetId will missing.
    if (!assetId) {
      return res.status(400).json({
        status: "failure",
        message: "assetId is missing !!!",
        data: ""
      });
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
      return res.status(404).json({
        status: "failure",
        message: "this is invalid asset id !!!",
        data: ""
      });
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
      return res.status(400).json({
        status: "failure",
        message: "This asset is not belong to your course!!!",
        data: ""
      });
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
      return res.status(404).json({
        status: "failure",
        message: "You have no created operation till now !!!",
        data: ""
      });
    }
    if (checkUnlockAssetId) {
      //check for available coin or not 
      //208[Already reported]
      return res.status(208).json({
        status:"warning",
        message: "You have already unlock this asset !!!",
        data:""
      });
    }

    let sumOfCoin = sumOfCoins[0].coins;
    if ((Math.abs(sumOfCoin) - Math.abs(assetData.coins) < 0)) {
      return res.status(299).json({
        status: "warning",
        message: "Sorry! But you have not sufficient ammount of coin to unlock this game !!!",
        data: ""
      });

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
    return res.status(200).json({
      status: "success",
      message: `${Math.abs(parseFloat(assetData.coins))} debit from your account.`,
      data: `${Math.abs(parseFloat(assetData.coins))}`,
    });


  } catch (err) {
    console.log("err : ", err)
    return res.status(500).json({
      status: "failure",
      message: "Internal Server Error !!!",
      data: ""
    });
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
    let coin=0
    if (sumOfCoins.length) {
      coin=sumOfCoins[0].coins
    }
    
    let resData={
      transaction: studentLedgerData,
      balance: coin
    };

    
    return res.status(200).json(resData);

  }
  catch (err) {
    console.log(err)
    return res.status(500).json({
      status: "failure",
      message: "Internal Server Error !!!",
      data: ""
    });
  }
}
export async function finalBalance(req, res) {
  try {
    const studentId = req.user_cxt.studentId;
    const StudentLedger = await StudentLedgerModel(req.user_cxt);
    const  sumOfCoins= await StudentLedger.aggregate([
      { $match: { studentId } },
      { $group: { _id: "$studentId", coins: { $sum: "$coins" } } }
    ]);
    let coin = 0
    if (sumOfCoins.length) {
      coin = sumOfCoins[0].coins
    }

    let resData = {
      balance: coin
    };


    return res.status(200).json(resData);

  }
  catch (err) {
    console.log(err)
    return res.status(500).json({
      status: "failure",
      message: "Internal Server Error !!!",
      data: ""
    });
  }
}

export default { creditCoin, debitCoin, studentCoinLog, finalBalance};
