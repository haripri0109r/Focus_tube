import { TaxonomyCategoryModule } from '../../types';
const m: TaxonomyCategoryModule = {
  category: 'CYBERSECURITY', type: 'EDU', version: '1.0.0',
  subtopics: {
    ethical_hacking: { weight: 50, keywords: ['ethical hacking','penetration testing','pentesting','ctf','capture the flag','red team','blue team','oscp','ceh','bug bounty','vulnerability assessment','exploit development','reverse engineering','malware analysis'] },
    cryptography: { weight: 48, keywords: ['cryptography','encryption','decryption','symmetric encryption','asymmetric encryption','rsa','aes','diffie hellman','digital signature','hash function','sha','md5','public key','private key','certificate','pki'] },
    network_security: { weight: 47, keywords: ['network security','firewall','ids','ips','intrusion detection','wireshark','nmap','packet sniffing','mitm','man in the middle','ddos','sql injection','xss','csrf','owasp top 10'] },
    web_security: { weight: 47, keywords: ['web security','owasp','sql injection tutorial','xss tutorial','cross site scripting','injection attack','authentication bypass','jwt security','session hijacking','cors misconfiguration'] },
    cloud_security: { weight: 45, keywords: ['cloud security','aws security','iam','identity access management','zero trust','devsecops','soc','siem','threat intelligence','incident response','forensics'] },
  },
};
export default m;
