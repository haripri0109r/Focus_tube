import { TaxonomyCategoryModule } from '../../types';
const m: TaxonomyCategoryModule = {
  category: 'CLOUD_DEVOPS', type: 'EDU', version: '1.0.0',
  subtopics: {
    cloud: { weight: 45, keywords: ['aws','amazon web services','azure','google cloud','gcp','cloud computing','serverless','lambda','ec2','s3','cloud storage','cloud architecture','cloud migration','multi cloud','hybrid cloud','iaas','paas','saas'] },
    devops: { weight: 45, keywords: ['devops','ci cd','continuous integration','continuous deployment','continuous delivery','pipeline','jenkins','github actions','gitlab ci','circle ci','travis ci','argocd','gitops'] },
    containers: { weight: 47, keywords: ['docker','dockerfile','container','containerization','kubernetes','k8s','helm','pod','deployment','service mesh','istio','envoy','docker compose','container orchestration'] },
    iac: { weight: 44, keywords: ['terraform','ansible','pulumi','chef','puppet','infrastructure as code','iac','provisioning','configuration management','cloud formation'] },
    monitoring: { weight: 42, keywords: ['monitoring','observability','prometheus','grafana','elk stack','elasticsearch','logstash','kibana','datadog','new relic','opentelemetry','distributed tracing','logging','alerting'] },
  },
};
export default m;
