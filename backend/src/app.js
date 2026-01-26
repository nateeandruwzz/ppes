import express from "express";
import cors from "cors";

import userRoute from "./routes/userRoute.js";
import positionRoute from "./routes/positionRoute.js";
import evaluationPeriodRoute from "./routes/evaluationPeriodRoute.js";
import departmentRoute from "./routes/departmentRoute.js";
import indicatorRoute from "./routes/indicatorRoute.js";
import selfEvaluation from "./routes/selfEvaluationRoute.js";
import evaluatee from "./routes/evaluateeRoute.js";
import evaluationTopic from "./routes/evaluationTopicRoute.js";
import evidence from "./routes/evidenceRoute.js";
import evaluationStatus from "./routes/evaluationStatusRoute.js";
import evaluationScale from "./routes/evaluationScaleRoute.js";
import evaluationResult from "./routes/evaluationResultRoute.js";
import evaluationCommittee from "./routes/evaluationCommitteeRoute.js";
import committeeSummary from "./routes/committeeSummaryRoute.js";
import committeeEvaluation from "./routes/committeeEvaluationRoute.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/user",userRoute);
app.use("/api/position", positionRoute);
app.use("/api/period", evaluationPeriodRoute);
app.use("/api/department", departmentRoute);
app.use("/api/indicator",indicatorRoute);
app.use("/api/selfEvaluation",selfEvaluation);
app.use("/api/evaluatee",evaluatee);
app.use("/api/topic",evaluationTopic);
app.use("/api/evidence",evidence);
app.use("/api/evaluationStatus",evaluationStatus);
app.use("/api/scale",evaluationScale);
app.use("/api/result",evaluationResult);
app.use("/api/summary",committeeSummary);
app.use("/api/committee",evaluationCommittee);
app.use("/api/evaluation",committeeEvaluation);

// --- 404 Handler ---
app.use((req, res) => {
  res.status(404).json({
    status: 404,
    message: "Endpoint not found"
  });
});

export default app;