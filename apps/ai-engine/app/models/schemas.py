from enum import Enum
from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field, HttpUrl
from datetime import datetime, timezone


class JurisdictionEnum(str, Enum):
    IN = "IN"
    UK = "UK"
    US = "US"
    SG = "SG"


class DocumentTypeEnum(str, Enum):
    CONTRACT_MSA = "CONTRACT_MSA"
    CONTRACT_NDA = "CONTRACT_NDA"
    CONTRACT_EMPLOYMENT = "CONTRACT_EMPLOYMENT"
    CONTRACT_LEASE = "CONTRACT_LEASE"
    STATUTE_NOTIFICATION = "STATUTE_NOTIFICATION"
    COURT_PETITION = "COURT_PETITION"
    JUDGMENT = "JUDGMENT"
    OTHER = "OTHER"


class ClauseTypeEnum(str, Enum):
    INDEMNITY = "INDEMNITY"
    LIMITATION_OF_LIABILITY = "LIMITATION_OF_LIABILITY"
    TERMINATION = "TERMINATION"
    GOVERNING_LAW_AND_JURISDICTION = "GOVERNING_LAW_AND_JURISDICTION"
    DISPUTE_RESOLUTION_ARBITRATION = "DISPUTE_RESOLUTION_ARBITRATION"
    CONFIDENTIALITY = "CONFIDENTIALITY"
    NON_COMPETE = "NON_COMPETE"
    INTELLECTUAL_PROPERTY = "INTELLECTUAL_PROPERTY"
    FORCE_MAJEURE = "FORCE_MAJEURE"
    PAYMENT_TERMS = "PAYMENT_TERMS"
    REPRESENTATIONS_AND_WARRANTIES = "REPRESENTATIONS_AND_WARRANTIES"
    MISCELLANEOUS = "MISCELLANEOUS"


class RiskSeverityEnum(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    INFORMATIONAL = "INFORMATIONAL"


class RiskCategoryEnum(str, Enum):
    STATUTORY_UNENFORCEABILITY = "STATUTORY_UNENFORCEABILITY"
    UNBOUNDED_FINANCIAL_LIABILITY = "UNBOUNDED_FINANCIAL_LIABILITY"
    ONE_SIDED_TERMINATION = "ONE_SIDED_TERMINATION"
    REGULATORY_NON_COMPLIANCE = "REGULATORY_NON_COMPLIANCE"
    JURISDICTIONAL_DEFECT = "JURISDICTIONAL_DEFECT"
    AMBIGUOUS_OBLIGATION = "AMBIGUOUS_OBLIGATION"
    IP_EXPOSURE = "IP_EXPOSURE"


class JudicialTreatmentStatusEnum(str, Enum):
    ACTIVE = "ACTIVE"
    OVERRULED = "OVERRULED"
    REVERSED = "REVERSED"
    DISTINGUISHED = "DISTINGUISHED"
    MODIFIED = "MODIFIED"


class BoundingBox(BaseModel):
    page: int
    x0: float
    y0: float
    x1: float
    y1: float


class ContractClause(BaseModel):
    clause_id: str
    document_id: str
    tenant_id: str
    clause_number: str
    clause_title: Optional[str] = None
    raw_text: str
    normalized_text: str
    clause_type: ClauseTypeEnum
    page_span: Dict[str, Any]
    cross_references: List[str] = []
    token_length: int


class StatutoryReference(BaseModel):
    statute_code: str
    act_title: str
    section_number: str
    section_title: Optional[str] = None
    exact_text_excerpt: str
    official_source_url: str
    is_mandatory: bool = True


class JudicialPrecedent(BaseModel):
    case_title: str
    digiscr_neutral_citation: str
    official_scr_citation: Optional[str] = None
    court: str = "Supreme Court of India"
    decision_date: str
    bench_strength: int = 2
    exact_ratio_excerpt: str
    treatment_status: JudicialTreatmentStatusEnum = JudicialTreatmentStatusEnum.ACTIVE
    treatment_details: Optional[str] = None
    overruled_by_citations: List[str] = []


class StructuredFeatures(BaseModel):
    clause_length_tokens: int
    liability_cap_ratio: float
    has_unilateral_termination: bool
    indemnity_carveouts_count: int
    non_compete_duration_months: int
    jurisdiction_divergence_flag: bool
    ambiguity_entropy_score: float
    penalty_doctrine_indicator: bool


class SHAPFeatureAttribution(BaseModel):
    feature_name: str
    feature_value: Union[str, int, float, bool]
    attribution_weight: float


class RiskFinding(BaseModel):
    risk_id: str
    clause_id: str
    clause_number: str
    category: RiskCategoryEnum
    severity: RiskSeverityEnum
    calibrated_risk_score: float
    structured_features: StructuredFeatures
    shap_attributions: List[SHAPFeatureAttribution]
    base_value: float
    qualitative_irac: Dict[str, str]
    exact_clause_text: str
    mitigation_recommendation: Dict[str, str]
    is_abstention: bool = False
    abstention_reason: Optional[str] = None
    hitl_reviewed: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class HealthCheckResponse(BaseModel):
    status: Literal["healthy", "degraded", "unhealthy"]
    service: str
    version: str
    uptime: float
    timestamp: str
    environment: str
    configured_models: Dict[str, str]
    provider: str
