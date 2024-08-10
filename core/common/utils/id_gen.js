exports.generatedId = (budget) => {
  if (!budget) {
    return null;
  }
  
  const id = budget._id;
  const regex = /\d+$/;
  const match = id.match(regex);
  const lastNumber = match[0];
  const numberInt = parseInt(lastNumber);
  const newNumberInt = numberInt + 1;

  const newBudgetId = id.replace(
    regex,
    newNumberInt.toString().padStart(lastNumber.length, "0")
  );

  return newBudgetId;
};
