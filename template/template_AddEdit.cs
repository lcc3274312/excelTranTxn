namespace ESOAF.Trade.PRD.<var_txnCode>.AddEditDel
{
    using System;
    using System.Data;
    using System.Globalization;
    using System.Threading.Tasks;
    using Esoaf.AP.Services.Databases;
    using Esoaf.Core.Trade.Base;
    using Esoaf.Kernel.Api;
    using Esoaf.Kernel.Services.GlobalParameter;
    using Microsoft.Extensions.Logging;

    /// <summary>
    /// <var_txnName> - 新增\修改
    /// </summary>
    [Txn]
    public class AddEdit : TxnBase
    {
        private readonly ProdDatabase prodDatabase;

        public class AddRequest
        {
<var_AddEditRequest>
        }

        public AddEdit(IServiceProvider serviceProvider, ProdDatabase prodDatabase) : base(serviceProvider)
        {
            this.prodDatabase = prodDatabase;
        }

        [TxnAction]
        public async Task<ApiResult> Process(AddRequest request)
        {
            Logger.LogTrace("{txnName} Process start", GetType().Name);

            ValidateRequest(request);
            using var dbTransaction = prodDatabase.BeginTransaction();
            using var cmd = prodDatabase.CreateCommand();

            cmd.CommandText = @"
<var_AddEditSql>
";
            string empNo = GlobalParameters.GetParameter(GlobalParameterDef.EmpNo);
<var_AddEditParameters>
            cmd.Parameters.Add("creator", SqlDbType.VarChar).Value = empNo;
            cmd.Parameters.Add("modifier", SqlDbType.VarChar).Value = empNo;

            int effectCount = Database.ExecuteNonQuery(cmd);
            dbTransaction.Commit();
            if (effectCount > 0)
            {
                Logger.LogTrace("{txnName} Process done", GetType().Name);
                return Success("A0003");
            }

            Logger.LogTrace("{txnName} Process done", GetType().Name);
            return Fail("E0003");
        }

        private void ValidateRequest(AddRequest request)
        {
            if (request == null)
            {
                Logger.LogError("request是null");
                throw new ApiException("Z9999", $"{nameof(request)} 是 null");
            }
        }
    }
}
